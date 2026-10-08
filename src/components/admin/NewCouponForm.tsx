"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCoupon } from "@/lib/actions/admin";

export default function NewCouponForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState(10);
  const [usageLimit, setUsageLimit] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await createCoupon({
      code,
      type,
      value,
      usage_limit: usageLimit ? parseInt(usageLimit) : null,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      active: true,
    });
    setLoading(false);
    if (!res.ok) {
      setError(res.message);
    } else {
      setCode("");
      setValue(10);
      setUsageLimit("");
      setExpiresAt("");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-inline-form" style={{ background: "#fff", borderRadius: "var(--radius-lg)", padding: 24, marginBottom: 32 }}>
      <div className="form-field" style={{ marginBottom: 0 }}>
        <label>Code</label>
        <input required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="WELCOME10" />
      </div>
      <div className="form-field" style={{ marginBottom: 0 }}>
        <label>Type</label>
        <select value={type} onChange={(e) => setType(e.target.value as "percent" | "fixed")}>
          <option value="percent">% off</option>
          <option value="fixed">$ off</option>
        </select>
      </div>
      <div className="form-field" style={{ marginBottom: 0 }}>
        <label>Value</label>
        <input type="number" required value={value} onChange={(e) => setValue(parseFloat(e.target.value))} />
      </div>
      <div className="form-field" style={{ marginBottom: 0 }}>
        <label>Usage Limit</label>
        <input type="number" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} placeholder="Unlimited" />
      </div>
      <div className="form-field" style={{ marginBottom: 0 }}>
        <label>Expires</label>
        <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
      </div>
      <button className="btn btn-dark btn-sm" type="submit" disabled={loading}>{loading ? "…" : "Add Coupon"}</button>
      {error && <p className="form-error" style={{ gridColumn: "1 / -1" }}>{error}</p>}
    </form>
  );
}
