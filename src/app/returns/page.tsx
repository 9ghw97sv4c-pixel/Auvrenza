import type { Metadata } from "next";

export const metadata: Metadata = { title: "Returns" };

export default function ReturnsPage() {
  return (
    <main className="section" style={{ paddingTop: 150 }}>
      <div className="wrap" style={{ maxWidth: 760 }}>
        <span className="eyebrow">Support</span>
        <h1 className="serif" style={{ fontSize: "2rem", marginBottom: 30 }}>Returns</h1>
        <div style={{ color: "var(--charcoal-soft)", fontWeight: 300, lineHeight: 1.8 }}>
          <p style={{ marginBottom: 20 }}>Unopened or gently used products can be returned within 30 days of delivery for a full refund.</p>
          <p style={{ marginBottom: 20 }}>To start a return, contact hello@avelis.com with your order number. We'll email you a prepaid return label where available.</p>
          <p>Refunds are issued to your original payment method within 5–7 business days of receiving your return.</p>
        </div>
      </div>
    </main>
  );
}
