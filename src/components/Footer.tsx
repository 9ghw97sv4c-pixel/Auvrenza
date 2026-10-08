"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-col">
            <div className="logo" style={{ marginBottom: 14 }}>AUVRENZA</div>
            <p style={{ color: "var(--charcoal-soft)", fontSize: "0.85rem", fontWeight: 300, maxWidth: "26ch" }}>
              Premium Korean skincare, curated with quiet precision.
            </p>
          </div>
          <div className="foot-col">
            <h4>Company</h4>
            <Link href="/#story">About</Link>
            <Link href="/shipping">Shipping</Link>
            <Link href="/returns">Returns</Link>
          </div>
          <div className="foot-col">
            <h4>Legal</h4>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
          <div className="foot-col">
            <h4>Follow</h4>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">TikTok</a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
          </div>
          <div className="foot-col">
            <h4>Support</h4>
            <Link href="/contact">Contact Us</Link>
            <Link href="/#faq">FAQ</Link>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© {new Date().getFullYear()} AUVRENZA. All rights reserved.</span>
          <span>Crafted with care in Seoul</span>
        </div>
      </div>
    </footer>
  );
}
