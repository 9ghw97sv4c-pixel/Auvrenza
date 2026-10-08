import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { requireEnv } from "@/lib/env";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, requireEnv("STRIPE_WEBHOOK_SECRET"));
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
  }

  const admin = createAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;
    const ownerId = session.metadata?.owner_id;
    if (!orderId) return NextResponse.json({ received: true });

    // Idempotency guard: Stripe can and does redeliver the same webhook event
    // (network retries/timeouts are expected, not exceptional). This UPDATE only
    // matches — and only returns a row — if the order is still "pending". A
    // redelivered event (or a truly concurrent duplicate delivery) will match
    // zero rows the second time, since Postgres serializes concurrent updates to
    // the same row. That's what makes this safe even under real concurrency, not
    // just sequential retries.
    const { data: updatedOrder } = await admin
      .from("orders")
      .update({ status: "paid", stripe_payment_intent: session.payment_intent as string })
      .eq("id", orderId)
      .eq("status", "pending")
      .select("id")
      .single();

    if (!updatedOrder) {
      // Already processed by a prior delivery of this same event — nothing left to do.
      return NextResponse.json({ received: true });
    }

    // Note: stock is NOT decremented here. It was already atomically reserved
    // via reserve_stock() when the checkout session was created (see
    // /api/checkout), specifically to close a race condition where two
    // concurrent buyers could both pass a stock check for the last unit.
    // Decrementing again here would double-count every sale.

    // Note: coupon usage is NOT bumped here. It was already atomically claimed
    // via try_use_coupon() when the checkout session was created, for the same
    // reason stock is reserved there — closes a race where two concurrent
    // checkouts with a near-exhausted coupon could both pass a plain read-check.

    // Clear the buyer's cart
    if (ownerId) {
      await admin.from("cart_items").delete().eq("owner_id", ownerId);
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;
    if (orderId) {
      // Same idempotency shape as above: only act if still pending, so a
      // redelivered "expired" event can't release stock a second time either.
      const { data: expiredOrder } = await admin
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderId)
        .eq("status", "pending")
        .select("id")
        .single();

      if (expiredOrder) {
        const { data: items } = await admin.from("order_items").select("*").eq("order_id", orderId);
        for (const item of items ?? []) {
          if (!item.product_id) continue;
          await admin.rpc("restore_stock", { p_product_id: item.product_id, p_quantity: item.quantity });
        }
        if (session.metadata?.coupon_id) {
          await admin.rpc("release_coupon_usage", { p_coupon_id: session.metadata.coupon_id });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
