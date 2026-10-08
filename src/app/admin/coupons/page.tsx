import { createAdminClient } from "@/lib/supabase/server";
import { toggleCoupon, deleteCoupon } from "@/lib/actions/admin";
import NewCouponForm from "@/components/admin/NewCouponForm";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const admin = createAdminClient();
  const { data: coupons } = await admin.from("coupons").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <div className="admin-header">
        <h1 className="serif" style={{ fontSize: "1.6rem" }}>Coupons</h1>
      </div>

      <NewCouponForm />

      <div className="table-scroll"><table className="admin-table">
        <thead>
          <tr><th>Code</th><th>Discount</th><th>Used</th><th>Expires</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {(coupons ?? []).map((c: any) => (
            <tr key={c.id}>
              <td style={{ fontWeight: 600 }}>{c.code}</td>
              <td>{c.type === "percent" ? `${c.value}%` : `$${c.value}`}</td>
              <td>{c.used_count}{c.usage_limit ? ` / ${c.usage_limit}` : ""}</td>
              <td>{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "Never"}</td>
              <td><span className={`status-pill ${c.active ? "status-paid" : "status-cancelled"}`}>{c.active ? "Active" : "Disabled"}</span></td>
              <td style={{ display: "flex", gap: 10 }}>
                <form action={toggleCoupon.bind(null, c.id, !c.active)}>
                  <button type="submit" style={{ background: "none", border: "none", fontSize: "0.8rem", textDecoration: "underline" }}>
                    {c.active ? "Disable" : "Enable"}
                  </button>
                </form>
                <form action={deleteCoupon.bind(null, c.id)}>
                  <button type="submit" style={{ background: "none", border: "none", fontSize: "0.8rem", color: "#a33", textDecoration: "underline" }}>
                    Delete
                  </button>
                </form>
              </td>
            </tr>
          ))}
          {(!coupons || coupons.length === 0) && (
            <tr><td colSpan={6} style={{ color: "var(--charcoal-soft)" }}>No coupons yet.</td></tr>
          )}
        </tbody>
      </table></div>
    </div>
  );
}
