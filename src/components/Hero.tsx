"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const INGREDIENTS = ["Centella Asiatica", "Snail Mucin", "Rice Water Extract", "Korean Ginseng", "Niacinamide", "Green Tea", "Propolis", "Hyaluronic Acid"];

export default function Hero() {
  const { t } = useLocale();
  const list = [...INGREDIENTS, ...INGREDIENTS];

  return (
    <section className="hero">
      <div className="hero-orb" />
      <div className="wrap hero-inner">
        <span className="eyebrow">{t.hero.eyebrow}</span>
        <h1>{t.hero.title}</h1>
        <p className="lead">{t.hero.lead}</p>
        <div className="hero-ctas">
          <Link className="btn btn-dark" href="/shop">{t.hero.shopNow}</Link>
          <Link className="btn btn-outline" href="/#brands">{t.hero.bestSellers}</Link>
        </div>
      </div>
      <div className="ingredient-marquee">
        <div className="marquee-track">
          {list.map((ing, i) => <span key={i}>{ing}</span>)}
        </div>
      </div>
    </section>
  );
}
