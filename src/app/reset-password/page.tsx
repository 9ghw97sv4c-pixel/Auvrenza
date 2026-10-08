"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePassword } from "@/lib/auth";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function ResetPasswordPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await updatePassword(password);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/account"), 1500);
    }
    setLoading(false);
  }

  return (
    <main className="section" style={{ paddingTop: 180, minHeight: "60vh" }}>
      <div className="wrap" style={{ maxWidth: 420 }}>
        <span className="eyebrow">Account</span>
        <h1 className="serif" style={{ fontSize: "1.8rem", marginBottom: 30 }}>{t.auth.updatePassword}</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>{t.auth.newPassword}</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">Password updated — redirecting…</p>}
          <button className="btn btn-dark" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
            {loading ? "…" : t.auth.updatePassword}
          </button>
        </form>
      </div>
    </main>
  );
}
