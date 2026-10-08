import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const STATUSES = ["all", "pending", "paid", "fulfilled", "cancelled", "refunded"] as const;

export default async function AdminOrdersPage({ searchParams }: { searchParams: { status?: string } }) {
  const admin = createAdminClient();
  const statusFilter = searchParams.status ?? "all";

  let query = admin.from("orders").select("*").order("created_at", { ascending: false });
  if (statusFilter !== "all") query = query.eq("status", statusFilter);
  const { data: orders } = await query;

  return (
    <div>
      <div className="admin-header">
        <h1 className="serif" style={{ fontSize: "1.6rem" }}>Orders</h1>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={s === "all" ? "/admin/orders" : `/admin/orders?status=${s}`}
            className="btn btn-outline btn-sm"
            style={{
              background: statusFilter === s ? "var(--charcoal)" : "transparent",
              color: statusFilter === s ? "#fff" : "var(--charcoal)",
            }}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="table-scroll"><table className="admin-table">
        <thead>
          <tr><th>Order</th><th>Customer</th><th>Status</th><th>Total</th><th>Date</th></tr>
        </thead>
        <tbody>
          {(orders ?? []).map((o: any) => (
            <tr key={o.id}>
              <td><Link href={`/admin/orders/${o.id}`} style={{ textDecoration: "underline" }}>#{o.id.slice(0, 8).toUpperCase()}</Link></td>
              <td>{o.contact_email}</td>
              <td><span className={`status-pill status-${o.status}`}>{o.status}</span></td>
              <td>${Number(o.total_usd).toFixed(2)}</td>
              <td>{new Date(o.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
          {(!orders || orders.length === 0) && (
            <tr><td colSpan={5} style={{ color: "var(--charcoal-soft)" }}>No orders found.</td></tr>
          )}
        </tbody>
      </table></div>
    </div>
  );
}
