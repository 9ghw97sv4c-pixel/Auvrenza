"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCurrency } from "@/lib/CurrencyProvider";
import { productName } from "@/lib/types";
import { useDialogKeyboard } from "@/lib/useDialogKeyboard";

const TONES = [
  "linear-gradient(135deg,#EFE8DD,#C9A96A)",
  "linear-gradient(135deg,#F8F6F3,#DED2B8)",
  "linear-gradient(135deg,#E9E2D4,#B99B62)",
];

export default function CartDrawer() {
  const cart = useCartStore();
  const { t, locale } = useLocale();
  const { format } = useCurrency();

  const panelRef = useDialogKeyboard(cart.isOpen, cart.close);

  if (!cart.isOpen) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={cart.close} />
      <div className="drawer-panel" ref={panelRef}>
        <div className="drawer-header">
          <h3 className="serif" style={{ fontSize: "1.2rem" }}>{t.common.cart} ({cart.count()})</h3>
          <button onClick={cart.close} aria-label="Close" style={{ background: "none", border: "none", fontSize: "1.3rem" }}>×</button>
        </div>

        <div className="drawer-body">
          {cart.lines.length === 0 && (
            <p style={{ color: "var(--charcoal-soft)", fontSize: "0.9rem", padding: "30px 0" }}>{t.common.emptyCart}</p>
          )}
          {cart.lines.map((line, i) => (
            <div className="cart-line" key={line.id}>
              <div className="cart-line-media" style={{ background: TONES[i % TONES.length] }} />
              <div className="cart-line-info">
                <div className="cart-line-title">{productName(line.product, locale)}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--charcoal-soft)" }}>{format(line.product.price_usd)}</div>
                <div className="qty-control">
                  <button onClick={() => cart.updateQuantity(line.id, line.quantity - 1)} aria-label="Decrease">−</button>
                  <span>{line.quantity}</span>
                  <button onClick={() => cart.updateQuantity(line.id, line.quantity + 1)} aria-label="Increase">+</button>
                </div>
                <button className="line-remove" onClick={() => cart.removeItem(line.id)}>{t.common.remove}</button>
              </div>
            </div>
          ))}
        </div>

        {cart.lines.length > 0 && (
          <div className="drawer-foot">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, fontSize: "0.95rem" }}>
              <span>{t.common.subtotal}</span>
              <strong>{format(cart.subtotalUsd())}</strong>
            </div>
            <Link href="/checkout" className="btn btn-dark" style={{ width: "100%", justifyContent: "center" }} onClick={cart.close}>
              {t.common.checkout}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
