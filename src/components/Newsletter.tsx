"use client";

import { useState } from "react";
import { subscribeToNewsletter } from "@/lib/actions/newsletter";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await subscribeToNewsletter(email);
    setStatus(res.message);
    if (res.ok) setEmail("");
    setLoading(false);
  }

  return (
    <section className="newsletter">
      <div className="wrap">
        <h2 className="serif">Skincare notes, quietly delivered</h2>
        <p>Routine guides, early access, and 10% off your first order.</p>
        <form className="newsletter-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>{loading ? "…" : status ?? "Subscribe"}</button>
        </form>
      </div>
    </section>
  );
}
