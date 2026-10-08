import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const admin = createAdminClient();

  const { data: profiles } = await admin.from("profiles").select("*").order("created_at", { ascending: false });
  const { data: orders } = await admin.from("orders").select("user_id, total_usd, status");

  const stats = new Map<string, { count: number; spent: number }>();
  for (const o of orders ?? []) {
    if (!o.user_id) continue;
    const entry = stats.get(o.user_id) ?? { count: 0, spent: 0 };
    entry.count += 1;
    if (o.status === "paid" || o.status === "fulfilled") entry.spent += Number(o.total_usd);
    stats.set(o.user_id, entry);
  }

  return (
    <div>
      <div className="admin-header">
        <h1 className="serif" style={{ fontSize: "1.6rem" }}>Customers</h1>
      </div>

      <div className="table-scroll"><table className="admin-table">
        <thead>
          <tr><th>Name</th><th>Role</th><th>Orders</th><th>Total Spent</th><th>Joined</th></tr>
        </thead>
        <tbody>
          {(profiles ?? []).map((p: any) => {
            const s = stats.get(p.id) ?? { count: 0, spent: 0 };
            return (
              <tr key={p.id}>
                <td>{p.full_name ?? "—"}</td>
                <td><span className={`status-pill ${p.role === "admin" ? "status-fulfilled" : "status-paid"}`}>{p.role}</span></td>
                <td>{s.count}</td>
                <td>${s.spent.toFixed(2)}</td>
                <td>{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            );
          })}
          {(!profiles || profiles.length === 0) && (
            <tr><td colSpan={5} style={{ color: "var(--charcoal-soft)" }}>No customers yet.</td></tr>
          )}
        </tbody>
      </table></div>
      <p style={{ fontSize: "0.8rem", color: "var(--charcoal-soft)", marginTop: 20 }}>
        To make someone an admin, run in the Supabase SQL editor:
        <code style={{ display: "block", marginTop: 8, background: "#fff", padding: 10, borderRadius: 4 }}>
          update profiles set role = &apos;admin&apos; where id = &apos;&lt;user-uuid&gt;&apos;;
        </code>
      </p>
    </div>
  );
}
