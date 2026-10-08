"use client";

import { useState } from "react";
import Reveal from "./Reveal";

const faqs = [
  { q: "Are all products 100% authentic?", a: "Yes — every item is sourced directly from verified Korean manufacturers and distributors. We never work with third-party resellers of uncertain origin." },
  { q: "How long does shipping take?", a: "Most orders arrive within 3–5 business days internationally. Tracking is provided at checkout for every order." },
  { q: "Can I return a product that doesn't suit my skin?", a: "Yes — unopened or gently used items can be returned within 30 days for a full refund, no questions asked." },
  { q: "How do I know which products suit my skin type?", a: "Each collection page notes recommended skin types, and our support team is happy to help you build a personalised routine." },
  { q: "What payment methods do you accept?", a: "We accept all major credit cards, PayPal, and Apple Pay, all processed through encrypted, secure checkout." },
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="section" id="faq">
      <div className="wrap" style={{ maxWidth: 820 }}>
        <Reveal>
          <div className="section-head">
            <span className="eyebrow">FAQ</span>
            <h2>Good to Know</h2>
          </div>
        </Reveal>
        <div>
          {faqs.map((f, i) => (
            <div className={`faq-item ${openIdx === i ? "open" : ""}`} key={f.q}>
              <button className="faq-q" onClick={() => setOpenIdx(openIdx === i ? null : i)}>
                {f.q}
                <span className="plus">+</span>
              </button>
              <div className="faq-a" style={{ maxHeight: openIdx === i ? 200 : 0 }}>
                <p>{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
