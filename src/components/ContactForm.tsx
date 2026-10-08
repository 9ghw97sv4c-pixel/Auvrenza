"use client";

import { useState } from "react";
import { submitContactMessage } from "@/lib/actions/contact";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await submitContactMessage({ name, email, message });
    setStatus(res);
    if (res.ok) { setName(""); setEmail(""); setMessage(""); }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-field"><label>Name</label><input required value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="form-field"><label>Email</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div className="form-field"><label>Message</label><textarea rows={4} required value={message} onChange={(e) => setMessage(e.target.value)} /></div>
      {status && <p className={status.ok ? "form-success" : "form-error"} role="status">{status.message}</p>}
      <button className="btn btn-dark" type="submit" disabled={loading}>{loading ? "…" : "Send Message"}</button>
    </form>
  );
}
