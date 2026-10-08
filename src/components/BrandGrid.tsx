"use client";

import Link from "next/link";
import Reveal from "./Reveal";

function brandSlug(brand: string) {
  return brand.toLowerCase().replace(/\s+/g, "-");
}

export default function BrandGrid({ brands }: { brands: string[] }) {
  if (!brands.length) return null;

  return (
    <div className="brand-grid">
      {brands.map((brand, i) => (
        <Reveal key={brand} delay={i * 60}>
          <Link href={`/brand/${brandSlug(brand)}`} className="brand-card">
            <div className="brand-card-inner">
              <span className="brand-name">{brand}</span>
              <span className="brand-cta">Shop →</span>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
