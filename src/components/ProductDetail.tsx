"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { productName } from "@/lib/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCurrency } from "@/lib/CurrencyProvider";
import { useCartStore } from "@/lib/cart-store";
import { useWishlistStore } from "@/lib/wishlist-store";
import { useUIStore } from "@/lib/ui-store";

const TONES = [
  "linear-gradient(135deg,#EFE8DD,#C9A96A)",
  "linear-gradient(135deg,#F8F6F3,#DED2B8)",
  "linear-gradient(135deg,#E9E2D4,#B99B62)",
  "linear-gradient(135deg,#F3EEE4,#CBB280)",
];

export default function ProductDetail({ product }: { product: Product }) {
  const { t, locale } = useLocale();
  const { format } = useCurrency();
  const cart = useCartStore();
  const wishlist = useWishlistStore();
  const { openAuthModal } = useUIStore();

  const [activeImg, setActiveImg] = useState(0);
  const [tab, setTab] = useState<"description" | "ingredients" | "benefits" | "reviews">("description");
  const [qty, setQty] = useState(1);
  const [zoomed, setZoomed] = useState(false);
  const [added, setAdded] = useState(false);

  const outOfStock = product.stock <= 0;
  const isWishlisted = wishlist.has(product.id);
  const discount = product.compare_at_price_usd
    ? Math.round((1 - product.price_usd / product.compare_at_price_usd) * 100)
    : 0;

  async function handleAdd() {
    if (outOfStock) return;
    await cart.addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  async function handleWishlist() {
    const res = await wishlist.toggle(product);
    if (res === "needs-auth") openAuthModal("login");
  }

  const galleryCount = Math.max(product.images?.length ?? 0, 4);
  const hasRealImages = (product.images?.length ?? 0) > 0;

  return (
    <>
      <div className="pdp-grid">
        <div>
          <div className="pdp-gallery-main" onClick={() => setZoomed((z) => !z)}>
            {hasRealImages ? (
              <div style={{ position: "relative", width: "100%", height: "100%", transform: zoomed ? "scale(1.4)" : "scale(1)", transition: "transform .4s var(--ease)" }}>
                <Image src={product.images[activeImg] ?? product.images[0]} alt={productName(product, locale)} fill sizes="(max-width: 860px) 100vw, 50vw" style={{ objectFit: "cover" }} priority />
              </div>
            ) : (
              <div
                style={{
                  width: "100%", height: "100%",
                  background: TONES[activeImg % TONES.length],
                  transform: zoomed ? "scale(1.4)" : "scale(1)",
                  transition: "transform .4s var(--ease)",
                }}
              />
            )}
          </div>
          <div className="pdp-thumbs">
            {Array.from({ length: hasRealImages ? product.images.length : galleryCount }).map((_, i) => (
              <button key={i} className={activeImg === i ? "active" : ""} onClick={() => setActiveImg(i)} aria-label={`View image ${i + 1} of ${productName(product, locale)}`}>
                {hasRealImages ? (
                  <div style={{ position: "relative", width: "100%", height: "100%" }}>
                    <Image src={product.images[i]} alt="" fill sizes="64px" style={{ objectFit: "cover" }} />
                  </div>
                ) : (
                  <div style={{ width: "100%", height: "100%", background: TONES[i % TONES.length] }} />
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="pcard-brand">{product.brand}</div>
          <h1 className="serif" style={{ fontSize: "2rem", marginBottom: 14 }}>{productName(product, locale)}</h1>
          <div className="pcard-rating" style={{ marginBottom: 18 }}>
            {"★".repeat(Math.round(product.rating))}{"☆".repeat(5 - Math.round(product.rating))}
            <span style={{ color: "var(--charcoal-soft)", marginLeft: 8, fontSize: "0.8rem" }}>({product.review_count} reviews)</span>
          </div>

          <div className="pcard-price" style={{ fontSize: "1.3rem", marginBottom: 26 }}>
            {product.compare_at_price_usd && <span className="price-original">{format(product.compare_at_price_usd)}</span>}
            <span className="price-sale">{format(product.price_usd)}</span>
            {discount > 0 && <span className="badge-sale" style={{ position: "static" }}>-{discount}%</span>}
          </div>

          <p style={{ color: "var(--charcoal-soft)", fontWeight: 300, lineHeight: 1.7, marginBottom: 30, maxWidth: "50ch" }}>
            {product.description_en}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
            <div className="qty-control" style={{ border: "1px solid var(--line)", padding: "8px 14px", borderRadius: 2 }}>
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">+</button>
            </div>
            <button className="btn btn-dark" onClick={handleAdd} disabled={outOfStock} style={{ flex: 1, justifyContent: "center" }}>
              {added ? t.common.addedToCart : outOfStock ? t.common.outOfStock : t.common.addToCart}
            </button>
            <button className={`wishlist-btn ${isWishlisted ? "active" : ""}`} onClick={handleWishlist} style={{ position: "static" }} aria-label={isWishlisted ? "Remove from wishlist" : t.common.wishlist}>
              <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 21s-7-4.6-9.5-9C.8 8.2 2.6 5 6 5c2 0 3.3 1 4 2 0.7-1 2-2 4-2 3.4 0 5.2 3.2 3.5 7-2.5 4.4-9.5 9-9.5 9z" /></svg>
            </button>
          </div>

          {product.skin_type?.length > 0 && (
            <p style={{ fontSize: "0.8rem", color: "var(--charcoal-soft)" }}>
              Recommended for: {product.skin_type.join(", ")} skin
            </p>
          )}

          <div className="pdp-tabs">
            {(["description", "ingredients", "benefits", "reviews"] as const).map((tb) => (
              <button key={tb} className={`pdp-tab ${tab === tb ? "active" : ""}`} onClick={() => setTab(tb)}>
                {tb}
              </button>
            ))}
          </div>
          <div style={{ fontSize: "0.9rem", color: "var(--charcoal-soft)", lineHeight: 1.8, fontWeight: 300, minHeight: 80 }}>
            {tab === "description" && (product.description_en || "No description yet.")}
            {tab === "ingredients" && (product.ingredients || "Ingredient list coming soon.")}
            {tab === "benefits" && (product.benefits || "Benefits coming soon.")}
            {tab === "reviews" && `${product.review_count} verified reviews, averaging ${product.rating}/5.`}
          </div>
        </div>
      </div>

      <div className="sticky-add-bar">
        <div style={{ minWidth: 0, flex: 1, overflow: "hidden", marginRight: 16 }}>
          <div style={{ fontFamily: "var(--font-fraunces)", fontSize: "0.95rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{productName(product, locale)}</div>
          <div style={{ fontSize: "0.85rem", color: "var(--charcoal-soft)" }}>{format(product.price_usd)}</div>
        </div>
        <button className="btn btn-dark btn-sm" onClick={handleAdd} disabled={outOfStock} style={{ flexShrink: 0 }}>
          {outOfStock ? t.common.outOfStock : t.common.addToCart}
        </button>
      </div>
    </>
  );
}
