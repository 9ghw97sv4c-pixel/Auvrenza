import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <main className="section" style={{ paddingTop: 150 }}>
      <div className="wrap" style={{ maxWidth: 760 }}>
        <span className="eyebrow">Legal</span>
        <h1 className="serif" style={{ fontSize: "2rem", marginBottom: 30 }}>Terms of Service</h1>
        <div style={{ color: "var(--charcoal-soft)", fontWeight: 300, lineHeight: 1.8 }}>
          <p style={{ marginBottom: 20 }}>
            By using the AVELIS website you agree to purchase products for personal use, provide accurate
            shipping and contact information, and comply with applicable import regulations in your country.
          </p>
          <p style={{ marginBottom: 20 }}>
            All product descriptions, imagery, and pricing are subject to change without notice. Prices displayed
            in currencies other than USD are indicative conversions and may differ slightly from the final charge.
          </p>
          <p>Replace this placeholder text with your finalized terms before launch.</p>
        </div>
      </div>
    </main>
  );
}
