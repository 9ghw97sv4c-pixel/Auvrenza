"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useWishlistStore } from "@/lib/wishlist-store";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useUser } from "@/lib/auth";
import { useUIStore } from "@/lib/ui-store";
import ProductCard from "@/components/ProductCard";

export default function WishlistPage() {
  const wishlist = useWishlistStore();
  const { t } = useLocale();
  const { user, isLoading } = useUser();
  const { openAuthModal } = useUIStore();

  useEffect(() => { if (user) wishlist.init(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="section" style={{ paddingTop: 150 }}>
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">{t.common.wishlist}</span>
          <h1>Saved for Later</h1>
        </div>

        {!isLoading && !user && (
          <div>
            <p style={{ color: "var(--charcoal-soft)", marginBottom: 24 }}>Log in to view and save your wishlist.</p>
            <button className="btn btn-dark" onClick={() => openAuthModal("login")}>{t.auth.login}</button>
          </div>
        )}

        {user && wishlist.lines.length === 0 && (
          <div>
            <p style={{ color: "var(--charcoal-soft)", marginBottom: 24 }}>{t.common.emptyWishlist}</p>
            <Link className="btn btn-dark" href="/shop">{t.common.continueShopping}</Link>
          </div>
        )}

        {user && wishlist.lines.length > 0 && (
          <div className="prod-grid">
            {wishlist.lines.map((l, i) => (
              <ProductCard key={l.id} product={l.product} toneIndex={i} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
