import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shipping" };

export default function ShippingPage() {
  return (
    <main className="section" style={{ paddingTop: 150 }}>
      <div className="wrap" style={{ maxWidth: 760 }}>
        <span className="eyebrow">Support</span>
        <h1 className="serif" style={{ fontSize: "2rem", marginBottom: 30 }}>Shipping</h1>
        <div style={{ color: "var(--charcoal-soft)", fontWeight: 300, lineHeight: 1.8 }}>
          <p style={{ marginBottom: 20 }}>Orders are processed within 1–2 business days and typically arrive within 3–5 business days internationally.</p>
          <p style={{ marginBottom: 20 }}>Free shipping applies automatically to orders over $75. Orders under that threshold have a flat $6.90 shipping fee.</p>
          <p>Tracking information is emailed as soon as your order ships.</p>
        </div>
      </div>
    </main>
  );
}
