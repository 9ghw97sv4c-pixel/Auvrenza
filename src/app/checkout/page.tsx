"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCurrency } from "@/lib/CurrencyProvider";
import { productName } from "@/lib/types";
import { useUser } from "@/lib/auth";

export default function CheckoutPage() {
  const cart = useCartStore();
  const { t, locale } = useLocale();
  const { format } = useCurrency();
  const { user } = useUser();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  const [coupon, setCoupon] = useState("");
  const [couponResult, setCouponResult] = useState<{ valid: boolean; message: string; type?: string; value?: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cart.init();
    if (user?.email) setEmail(user.email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const subtotal = cart.subtotalUsd();
  const discount = couponResult?.valid
    ? couponResult.type === "percent"
      ? subtotal * ((couponResult.value ?? 0) / 100)
      : couponResult.value ?? 0
    : 0;
  const shipping = subtotal - discount >= 75 ? 0 : 6.9;
  const total = Math.max(0, subtotal - discount + shipping);

  async function applyCoupon() {
    if (!coupon.trim()) return;
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: coupon.trim() }),
    });
    setCouponResult(await res.json());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId: cart.ownerId,
          items: cart.lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
          email,
          shippingAddress: { fullName, line1, city, postalCode, country },
          couponCode: couponResult?.valid ? coupon.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Something went wrong.");
      }
    } catch {
      setError("Could not start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (cart.lines.length === 0) {
    return (
      <main className="section" style={{ paddingTop: 150 }}>
        <div className="wrap">
          <p style={{ color: "var(--charcoal-soft)" }}>{t.common.emptyCart}</p>
          <button className="btn btn-dark" onClick={() => router.push("/shop")} style={{ marginTop: 20 }}>
            {t.common.continueShopping}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="section" style={{ paddingTop: 150 }}>
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">{t.checkout.title}</span>
          <h1>Secure Checkout</h1>
        </div>

        <div className="split-layout">
          <form onSubmit={handleSubmit}>
            <h3 className="serif" style={{ fontSize: "1.1rem", marginBottom: 20 }}>{t.checkout.contactEmail}</h3>
            <div className="form-field">
              <label>{t.auth.email}</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <h3 className="serif" style={{ fontSize: "1.1rem", margin: "34px 0 20px" }}>{t.checkout.shippingAddress}</h3>
            <div className="form-field">
              <label>Full Name</label>
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Address</label>
              <input required value={line1} onChange={(e) => setLine1(e.target.value)} />
            </div>
            <div className="form-grid-2">
              <div className="form-field">
                <label>City</label>
                <input required value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Postal Code</label>
                <input required value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
              </div>
            </div>
            <div className="form-field">
              <label>Country</label>
              <input required value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. Uzbekistan, South Korea, United States" />
            </div>

            {error && <p className="form-error">{error}</p>}

            <button className="btn btn-dark" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: 20 }}>
              {loading ? "…" : `${t.checkout.placeOrder} — ${format(total)}`}
            </button>
            <p style={{ fontSize: "0.75rem", color: "var(--charcoal-soft)", marginTop: 14, textAlign: "center" }}>
              You'll be redirected to Stripe's secure payment page to complete your purchase.
            </p>
          </form>

          <div style={{ background: "var(--ivory)", borderRadius: "var(--radius-lg)", padding: 30, height: "fit-content" }}>
            <h3 className="serif" style={{ fontSize: "1.2rem", marginBottom: 20 }}>{t.checkout.orderSummary}</h3>
            {cart.lines.map((l) => (
              <div key={l.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 10 }}>
                <span>{productName(l.product, locale)} × {l.quantity}</span>
                <span>{format(l.product.price_usd * l.quantity)}</span>
              </div>
            ))}

            <div style={{ display: "flex", gap: 10, margin: "20px 0" }}>
              <input
                placeholder={t.checkout.couponCode}
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                style={{ flex: 1, border: "1px solid var(--line)", padding: "10px 12px", fontSize: "0.85rem", borderRadius: 2 }}
              />
              <button type="button" className="btn btn-outline btn-sm" onClick={applyCoupon}>{t.checkout.apply}</button>
            </div>
            {couponResult && (
              <p className={couponResult.valid ? "form-success" : "form-error"} style={{ marginBottom: 16 }}>{couponResult.message}</p>
            )}

            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: 8 }}>
                <span>{t.common.subtotal}</span><span>{format(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: 8, color: "var(--gold-deep)" }}>
                  <span>Discount</span><span>−{format(discount)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: 8 }}>
                <span>Shipping</span><span>{shipping === 0 ? "Free" : format(shipping)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.05rem", fontWeight: 600, marginTop: 12 }}>
                <span>{t.common.total}</span><span>{format(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
