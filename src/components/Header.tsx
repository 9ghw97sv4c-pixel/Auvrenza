"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { localeNames, locales } from "@/lib/i18n/config";
import { useCurrency } from "@/lib/CurrencyProvider";
import { useCartStore } from "@/lib/cart-store";
import { useWishlistStore } from "@/lib/wishlist-store";
import { useUIStore } from "@/lib/ui-store";
import { useUser } from "@/lib/auth";

export default function Header() {
  const [solid, setSolid] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  const { locale, setLocale, t } = useLocale();
  const { currency, setCurrency } = useCurrency();
  const cart = useCartStore();
  const wishlist = useWishlistStore();
  const { user } = useUser();
  const { openAuthModal } = useUIStore();

  useEffect(() => {
    cart.init();
    wishlist.init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchOpen(false);
    router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
  }

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className={`site-header ${solid ? "solid" : ""}`}>
      <div className="wrap nav">
        <Link href="/" className="logo">AUVRENZA</Link>

        <nav className="nav-links">
          <Link href="/shop">{t.nav.shop}</Link>
          <Link href="/#brands">Brands</Link>
          <Link href="/shop?filter=bestseller">{t.nav.bestsellers}</Link>
          <Link href="/#collections">{t.nav.collections}</Link>
          <Link href="/#story">{t.nav.story}</Link>
          <Link href="/#reviews">{t.nav.reviews}</Link>
        </nav>

        <div className="nav-icons">
          <button
            className="hamburger-btn"
            aria-label="Menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((s) => !s)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {mobileOpen ? (
                <><line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" /></>
              ) : (
                <><line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" /></>
              )}
            </svg>
          </button>

          {/* Search */}
          <div className="switcher">
            <button aria-label={t.common.search} onClick={() => setSearchOpen((s) => !s)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.6" y2="16.6" />
              </svg>
            </button>
            {searchOpen && (
              <form onSubmit={submitSearch} className="switcher-menu" style={{ padding: 12, minWidth: 240 }}>
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.common.search + "…"}
                  style={{ width: "100%", border: "1px solid var(--line)", padding: "9px 10px", fontSize: "0.85rem", borderRadius: 2 }}
                />
              </form>
            )}
          </div>

          {/* Wishlist */}
          <Link href="/wishlist" aria-label={t.common.wishlist}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M12 21s-7-4.6-9.5-9C.8 8.2 2.6 5 6 5c2 0 3.3 1 4 2 0.7-1 2-2 4-2 3.4 0 5.2 3.2 3.5 7-2.5 4.4-9.5 9-9.5 9z" />
            </svg>
            {wishlist.lines.length > 0 && <span className="icon-badge">{wishlist.lines.length}</span>}
          </Link>

          {/* Cart */}
          <button aria-label={t.common.cart} onClick={() => cart.open()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M6 7h13l-1.2 10.4A2 2 0 0 1 15.8 19H8.2a2 2 0 0 1-2-1.6L5 7z" /><path d="M9 7V5a3 3 0 0 1 6 0v2" />
            </svg>
            {cart.count() > 0 && <span className="icon-badge">{cart.count()}</span>}
          </button>

          {/* Account */}
          {user ? (
            <Link href="/account" aria-label={t.common.account}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <circle cx="12" cy="8" r="3.4" /><path d="M4.5 20c1.4-3.6 4.3-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
              </svg>
            </Link>
          ) : (
            <button aria-label={t.common.account} onClick={() => openAuthModal("login")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <circle cx="12" cy="8" r="3.4" /><path d="M4.5 20c1.4-3.6 4.3-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
              </svg>
            </button>
          )}

          {/* Language switcher — hidden on small screens, moved into the mobile menu panel instead */}
          <div className="switcher switcher-lang-currency">
            <button className="switcher-btn" onClick={() => { setLangOpen((s) => !s); setCurrencyOpen(false); }}>
              {locale.toUpperCase()}
            </button>
            {langOpen && (
              <div className="switcher-menu">
                {locales.map((l) => (
                  <button key={l} className={l === locale ? "active" : ""} onClick={() => { setLocale(l); setLangOpen(false); }}>
                    {localeNames[l]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Currency switcher — hidden on small screens, moved into the mobile menu panel instead */}
          <div className="switcher switcher-lang-currency">
            <button className="switcher-btn" onClick={() => { setCurrencyOpen((s) => !s); setLangOpen(false); }}>
              {currency}
            </button>
            {currencyOpen && (
              <div className="switcher-menu">
                {(["USD", "KRW", "UZS"] as const).map((c) => (
                  <button key={c} className={c === currency ? "active" : ""} onClick={() => { setCurrency(c); setCurrencyOpen(false); }}>
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-menu-panel">
          <nav className="mobile-menu-links">
            <Link href="/shop">{t.nav.shop}</Link>
          <Link href="/#brands">Brands</Link>
            <Link href="/shop?filter=bestseller">{t.nav.bestsellers}</Link>
            <Link href="/#collections">{t.nav.collections}</Link>
            <Link href="/#story">{t.nav.story}</Link>
            <Link href="/#reviews">{t.nav.reviews}</Link>
          </nav>

          <div className="mobile-menu-switchers">
            <div>
              <span className="mobile-menu-switch-label">Language</span>
              <div className="mobile-menu-switch-options">
                {locales.map((l) => (
                  <button key={l} className={l === locale ? "active" : ""} onClick={() => setLocale(l)}>
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="mobile-menu-switch-label">Currency</span>
              <div className="mobile-menu-switch-options">
                {(["USD", "KRW", "UZS"] as const).map((c) => (
                  <button key={c} className={c === currency ? "active" : ""} onClick={() => setCurrency(c)}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mobile-menu-foot">
            {user ? (
              <Link href="/account" className="btn btn-outline btn-sm">{t.common.account}</Link>
            ) : (
              <button className="btn btn-outline btn-sm" onClick={() => { openAuthModal("login"); setMobileOpen(false); }}>
                {t.auth.login}
              </button>
            )}
            <Link href="/wishlist" className="btn btn-outline btn-sm">{t.common.wishlist}</Link>
          </div>
        </div>
      )}
    </header>
  );
}
