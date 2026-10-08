"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCurrency } from "@/lib/CurrencyProvider";
import { productName } from "@/lib/types";

const TONES = [
  "linear-gradient(135deg,#EFE8DD,#C9A96A)",
  "linear-gradient(135deg,#F8F6F3,#DED2B8)",
  "linear-gradient(135deg,#E9E2D4,#B99B62)",
];

export default function CartPage() {
  const cart = useCartStore();
  const { t, locale } = useLocale();
  const { format } = useCurrency();

  useEffect(() => { cart.init(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="section" style={{ paddingTop: 150 }}>
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">{t.common.cart}</span>
          <h1>Your Bag</h1>
        </div>

        {cart.lines.length === 0 ? (
          <div>
            <p style={{ color: "var(--charcoal-soft)", marginBottom: 24 }}>{t.common.emptyCart}</p>
            <Link className="btn btn-dark" href="/shop">{t.common.continueShopping}</Link>
          </div>
        ) : (
          <div className="split-layout">
            <div>
              {cart.lines.map((line, i) => (
                <div className="cart-line" key={line.id} style={{ alignItems: "center" }}>
                  <div className="cart-line-media" style={{ background: TONES[i % TONES.length], width: 96, height: 118 }} />
                  <div className="cart-line-info">
                    <div className="cart-line-title" style={{ fontSize: "1.1rem" }}>{productName(line.product, locale)}</div>
                    <div style={{ fontSize: "0.9rem", color: "var(--charcoal-soft)", marginBottom: 8 }}>{format(line.product.price_usd)}</div>
                    <div className="qty-control">
                      <button onClick={() => cart.updateQuantity(line.id, line.quantity - 1)} aria-label={`Decrease quantity of ${productName(line.product, locale)}`}>−</button>
                      <span>{line.quantity}</span>
                      <button onClick={() => cart.updateQuantity(line.id, line.quantity + 1)} aria-label={`Increase quantity of ${productName(line.product, locale)}`}>+</button>
                    </div>
                    <button className="line-remove" onClick={() => cart.removeItem(line.id)}>{t.common.remove}</button>
                  </div>
                  <div style={{ fontWeight: 600 }}>{format(line.product.price_usd * line.quantity)}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "var(--ivory)", borderRadius: "var(--radius-lg)", padding: 30, height: "fit-content" }}>
              <h3 className="serif" style={{ fontSize: "1.2rem", marginBottom: 22 }}>{t.checkout.orderSummary}</h3>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, fontSize: "0.9rem" }}>
                <span>{t.common.subtotal}</span>
                <span>{format(cart.subtotalUsd())}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 22, fontSize: "1.05rem", fontWeight: 600, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
                <span>{t.common.total}</span>
                <span>{format(cart.subtotalUsd())}</span>
              </div>
              <Link className="btn btn-dark" href="/checkout" style={{ width: "100%", justifyContent: "center" }}>
                {t.common.checkout}
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
