"use client";

import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/lib/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const TONES = [
  "linear-gradient(135deg,#EFE8DD,#C9A96A)",
  "linear-gradient(135deg,#F8F6F3,#DED2B8)",
  "linear-gradient(135deg,#E9E2D4,#B99B62)",
  "linear-gradient(135deg,#F3EEE4,#CBB280)",
  "linear-gradient(135deg,#EEE7DA,#AE8C56)",
  "linear-gradient(135deg,#F6F1E8,#D6BE8E)",
];

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  const { locale } = useLocale();

  return (
    <div className="cat-grid">
      {categories.map((c, i) => {
        const name = (c as any)[`name_${locale}`] || c.name_en;
        return (
          <Link key={c.id} href={`/category/${c.slug}`} className="cat-card">
            {c.image_url ? (
              <Image src={c.image_url} alt={name} fill sizes="(max-width: 900px) 50vw, 33vw" style={{ objectFit: "cover" }} />
            ) : (
              <div className="cat-bg" style={{ background: TONES[i % TONES.length] }} />
            )}
            <div className="cat-overlay" />
            <div className="cat-label">
              <span className="cat-sub">Step {String(i + 1).padStart(2, "0")}</span>
              <div className="serif">{name}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
