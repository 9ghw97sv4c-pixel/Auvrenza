import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const FREE_SHIPPING_THRESHOLD = 75;
const FLAT_SHIPPING_USD = 6.9;

interface CheckoutBody {
  ownerId: string;
  items: { productId: string; quantity: number }[];
  email: string;
  shippingAddress: {
    line1: string;
    city: string;
    postalCode: string;
    country: string;
    fullName: string;
  };
  couponCode?: string;
}

export async function POST(req: Request) {
  const body: CheckoutBody = await req.json();

  if (!body.items?.length) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const supabase = createClient();
  const admin = createAdminClient();

  // Resolve the authenticated user server-side (never trust body.ownerId for this —
  // it's client-supplied). This is what makes orders show up in /account order history.
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id ?? null;

  // Re-fetch authoritative prices/stock from the DB — never trust client-sent prices.
  const productIds = body.items.map((i) => i.productId);
  const { data: products, error } = await supabase.from("products").select("*").in("id", productIds);
  if (error || !products?.length) {
    return NextResponse.json({ error: "Could not load products." }, { status: 400 });
  }

  let subtotal = 0;
  let lineItems: { product: any; quantity: number }[];
  try {
    lineItems = body.items.map((item) => {
      const product = products.find((p: any) => p.id === item.productId);
      if (!product) throw new Error("One of the items in your cart is no longer available.");
      if (product.stock < item.quantity) throw new Error(`${product.name_en} is out of stock.`);
      subtotal += product.price_usd * item.quantity;
      return { product, quantity: item.quantity };
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // Coupon
  let discount = 0;
  let couponCode: string | null = null;
  let couponId: string | null = null;
  if (body.couponCode) {
    const { data: coupon } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", body.couponCode.toUpperCase())
      .eq("active", true)
      .single();
    const notExpired = coupon && (!coupon.expires_at || new Date(coupon.expires_at) > new Date());
    const underLimit = coupon && (!coupon.usage_limit || coupon.used_count < coupon.usage_limit);
    if (coupon && notExpired && underLimit) {
      discount = coupon.type === "percent" ? subtotal * (coupon.value / 100) : coupon.value;
      couponCode = coupon.code;
      couponId = coupon.id;
    }
  }

  const shipping = subtotal - discount >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_USD;
  const total = Math.max(0, subtotal - discount + shipping);

  // Create a pending order first so we have an id to attach to the Stripe session
  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: userId,
      status: "pending",
      currency: "USD",
      subtotal_usd: subtotal,
      discount_usd: discount,
      shipping_usd: shipping,
      total_usd: total,
      coupon_code: couponCode,
      contact_email: body.email,
      shipping_address: body.shippingAddress,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Could not create order." }, { status: 500 });
  }

  await admin.from("order_items").insert(
    lineItems.map(({ product, quantity }) => ({
      order_id: order.id,
      product_id: product.id,
      product_name: product.name_en,
      unit_price_usd: product.price_usd,
      quantity,
    }))
  );

  // Atomically reserve stock for every line item, in parallel — sequential
  // round-trips here would add real latency for any cart with several distinct
  // products, since each is a separate network call to Supabase. `reserve_stock`
  // runs as a single UPDATE ... WHERE stock >= quantity inside Postgres, so two
  // simultaneous checkouts for the last unit of a product cannot both succeed —
  // the loser gets `false` here instead of silently overselling (the earlier
  // plain `product.stock < item.quantity` check above is only a fast, friendly
  // early rejection; this is the actual authoritative, race-safe gate).
  const reservationAttempts = await Promise.all(
    lineItems.map(async ({ product, quantity }) => {
      const { data: ok, error: reserveError } = await admin.rpc("reserve_stock", {
        p_product_id: product.id,
        p_quantity: quantity,
      });
      return { product, quantity, ok: !reserveError && !!ok };
    })
  );

  const failedReservation = reservationAttempts.find((r) => !r.ok);
  if (failedReservation) {
    // Roll back every reservation that DID succeed before bailing out.
    for (const r of reservationAttempts) {
      if (r.ok) {
        await admin.rpc("restore_stock", { p_product_id: r.product.id, p_quantity: r.quantity });
      }
    }
    await admin.from("orders").update({ status: "cancelled" }).eq("id", order.id);
    return NextResponse.json(
      { error: `${failedReservation.product.name_en} just sold out. Please update your cart and try again.` },
      { status: 409 }
    );
  }
  const reserved = reservationAttempts.map((r) => ({ productId: r.product.id, quantity: r.quantity }));

  // Same atomicity concern as stock: claim the coupon usage with a single
  // conditional UPDATE so a coupon can't be redeemed past its usage_limit by
  // two concurrent checkouts both passing the plain read-check above.
  if (couponId) {
    const { data: couponOk } = await admin.rpc("try_use_coupon", { p_coupon_id: couponId });
    if (!couponOk) {
      for (const r of reserved) {
        await admin.rpc("restore_stock", { p_product_id: r.productId, p_quantity: r.quantity });
      }
      await admin.from("orders").update({ status: "cancelled" }).eq("id", order.id);
      return NextResponse.json(
        { error: "That coupon just reached its usage limit. Please remove it and try again." },
        { status: 409 }
      );
    }
  }

  // If a coupon discount applies, collapse to a single line item so the
  // Stripe-charged amount matches `total` exactly (Stripe price_data can't be negative).
  const stripeLineItems: any[] =
    discount > 0
      ? [
          {
            price_data: {
              currency: "usd",
              product_data: { name: `AVELIS Order${couponCode ? ` (code ${couponCode})` : ""}` },
              unit_amount: Math.round((subtotal - discount) * 100),
            },
            quantity: 1,
          },
        ]
      : lineItems.map(({ product, quantity }) => ({
          price_data: {
            currency: "usd",
            product_data: { name: product.name_en, images: product.images?.length ? [product.images[0]] : undefined },
            unit_amount: Math.round(product.price_usd * 100),
          },
          quantity,
        }));

  if (shipping > 0) {
    stripeLineItems.push({
      price_data: { currency: "usd", product_data: { name: "Shipping" }, unit_amount: Math.round(shipping * 100) },
      quantity: 1,
    });
  }

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: stripeLineItems,
      customer_email: body.email,
      // Stock is reserved the moment this session is created (see reserve_stock
      // above), so we deliberately keep the session short-lived — otherwise an
      // abandoned checkout could hold real inventory hostage for up to Stripe's
      // default 24h session lifetime. The `checkout.session.expired` webhook
      // releases the reservation when this expires.
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
      metadata: {
        order_id: order.id,
        owner_id: body.ownerId,
        coupon_code: couponCode ?? "",
        coupon_id: couponId ?? "",
      },
    });
  } catch (err: any) {
    // Stripe itself failed after we'd already reserved stock (and possibly
    // claimed a coupon use) — release both, otherwise this failure would leave
    // inventory short and a coupon slot burned for an order that never got a
    // valid Stripe session at all.
    for (const r of reserved) {
      await admin.rpc("restore_stock", { p_product_id: r.productId, p_quantity: r.quantity });
    }
    if (couponId) {
      await admin.rpc("release_coupon_usage", { p_coupon_id: couponId });
    }
    await admin.from("orders").update({ status: "cancelled" }).eq("id", order.id);
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 500 });
  }

  await admin.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);

  return NextResponse.json({ url: session.url });
}
