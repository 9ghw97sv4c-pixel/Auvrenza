import Link from "next/link";
import Reveal from "./Reveal";

const collections = [
  { name: "Glass Skin Collection", slug: "glass-skin", cls: "coll-1", tone: "linear-gradient(135deg,#EFE8DD,#C9A96A)" },
  { name: "Morning Routine", slug: "morning-routine", cls: "coll-2", tone: "linear-gradient(135deg,#F8F6F3,#DED2B8)" },
  { name: "Sensitive Skin", slug: "sensitive-skin", cls: "coll-3", tone: "linear-gradient(135deg,#E9E2D4,#B99B62)" },
  { name: "Anti-Aging", slug: "anti-aging", cls: "coll-4", tone: "linear-gradient(135deg,#F3EEE4,#CBB280)" },
  { name: "Night Routine", slug: "night-routine", cls: "coll-5", tone: "linear-gradient(135deg,#EEE7DA,#AE8C56)" },
  { name: "Acne Care", slug: "acne-care", cls: "coll-6", tone: "linear-gradient(135deg,#F6F1E8,#D6BE8E)" },
];

export default function Collections() {
  return (
    <section className="section" id="collections" style={{ background: "var(--ivory)" }}>
      <div className="wrap">
        <Reveal>
          <div className="section-head">
            <span className="eyebrow">Featured Collections</span>
            <h2>Routines Built for You</h2>
          </div>
        </Reveal>
        <Reveal>
          <div className="collection-grid">
            {collections.map((c) => (
              <Link key={c.slug} href={`/shop?collection=${c.slug}`} className={`coll-card ${c.cls}`}>
                <div className="coll-bg" style={{ background: c.tone }} />
                <div className="coll-overlay" />
                <div className="coll-label"><div className="serif">{c.name}</div></div>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
