"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
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
  "linear-gradient(135deg,#EEE7DA,#AE8C56)",
  "linear-gradient(135deg,#F6F1E8,#D6BE8E)",
];

export default function ProductCard({ product, toneIndex = 0 }: { product: Product; toneIndex?: number }) {
  const { t, locale } = useLocale();
  const { format } = useCurrency();
  const cart = useCartStore();
  const wishlist = useWishlistStore();
  const { openAuthModal } = useUIStore();
  const [justAdded, setJustAdded] = useState(false);

  const isWishlisted = wishlist.has(product.id);
  const outOfStock = product.stock <= 0;
  const discount = product.compare_at_price_usd
    ? Math.round((1 - product.price_usd / product.compare_at_price_usd) * 100)
    : 0;

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (outOfStock) return;
    await cart.addItem(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  }

  async function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    const result = await wishlist.toggle(product);
    if (result === "needs-auth") openAuthModal("login");
  }

  return (
    <div className="pcard">
      <Link href={`/product/${product.slug}`} className="pcard-media">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={productName(product, locale)}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className="pmedia-bg" style={{ background: TONES[toneIndex % TONES.length] }} />
        )}
        {discount > 0 && <span className="badge-sale">-{discount}%</span>}
        {outOfStock && <div className="badge-outofstock">{t.common.outOfStock}</div>}
        <button className={`wishlist-btn ${isWishlisted ? "active" : ""}`} onClick={handleWishlist} aria-label={isWishlisted ? "Remove from wishlist" : t.common.wishlist}>
          <svg viewBox="0 0 24 24"><path d="M12 21s-7-4.6-9.5-9C.8 8.2 2.6 5 6 5c2 0 3.3 1 4 2 0.7-1 2-2 4-2 3.4 0 5.2 3.2 3.5 7-2.5 4.4-9.5 9-9.5 9z" /></svg>
        </button>
        <button className="cart-hover" onClick={handleAddToCart} disabled={outOfStock}>
          {justAdded ? t.common.addedToCart : outOfStock ? t.common.outOfStock : `+ ${t.common.addToCart}`}
        </button>
      </Link>
      <div className="pcard-brand">{product.brand}</div>
      <Link href={`/product/${product.slug}`}>
        <div className="pcard-title">{productName(product, locale)}</div>
      </Link>
      <div className="pcard-rating">{"★".repeat(Math.round(product.rating))}{"☆".repeat(5 - Math.round(product.rating))}</div>
      <div className="pcard-price">
        {product.compare_at_price_usd && <span className="price-original">{format(product.compare_at_price_usd)}</span>}
        <span className="price-sale">{format(product.price_usd)}</span>
      </div>
    </div>
  );
}
