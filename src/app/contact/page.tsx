import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with AVELIS — questions about orders, products, or Korean skincare routines.",
};

export default function ContactPage() {
  return (
    <main className="section" style={{ paddingTop: 150, background: "var(--ivory)" }}>
      <div className="wrap contact-grid">
        <div>
          <span className="eyebrow">Contact</span>
          <h1 className="serif" style={{ fontSize: "2rem", marginBottom: 30 }}>We&apos;re here to help</h1>
          <div className="contact-item"><span className="label">Email</span><span className="val">hello@avelis.com</span></div>
          <div className="contact-item"><span className="label">Phone</span><span className="val">+82 10 0000 0000</span></div>
          <div className="contact-item"><span className="label">Studio</span><span className="val">Seoul, South Korea</span></div>
        </div>
        <div>
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
