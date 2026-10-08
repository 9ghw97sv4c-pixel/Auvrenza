import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <main className="section" style={{ paddingTop: 150 }}>
      <div className="wrap" style={{ maxWidth: 760 }}>
        <span className="eyebrow">Legal</span>
        <h1 className="serif" style={{ fontSize: "2rem", marginBottom: 30 }}>Privacy Policy</h1>
        <div style={{ color: "var(--charcoal-soft)", fontWeight: 300, lineHeight: 1.8 }}>
          <p style={{ marginBottom: 20 }}>
            AVELIS collects only the information needed to process your orders and improve your experience: your
            name, email, shipping address, and order history. We never sell your personal data to third parties.
          </p>
          <p style={{ marginBottom: 20 }}>
            Payment details are processed securely by Stripe and never touch our servers directly. Account
            authentication is handled by Supabase using industry-standard encryption.
          </p>
          <p>Replace this placeholder text with your finalized privacy policy before launch.</p>
        </div>
      </div>
    </main>
  );
}
