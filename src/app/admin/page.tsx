import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const admin = createAdminClient();

  const [ordersRes, productsRes, customersRes, recentOrdersRes] = await Promise.all([
    admin.from("orders").select("total_usd, status"),
    admin.from("products").select("id", { count: "exact", head: true }),
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("orders").select("id, contact_email, total_usd, status, created_at").order("created_at", { ascending: false }).limit(8),
  ]);

  const orders = ordersRes.data ?? [];
  const paidOrders = orders.filter((o: any) => o.status === "paid" || o.status === "fulfilled");
  const totalRevenue = paidOrders.reduce((sum: number, o: any) => sum + Number(o.total_usd), 0);
  const totalOrders = orders.length;
  const totalProducts = productsRes.count ?? 0;
  const totalCustomers = customersRes.count ?? 0;
  const recentOrders = recentOrdersRes.data ?? [];

  return (
    <div>
      <div className="admin-header">
        <h1 className="serif" style={{ fontSize: "1.6rem" }}>Dashboard</h1>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">${totalRevenue.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Orders</div>
          <div className="stat-value">{totalOrders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Products</div>
          <div className="stat-value">{totalProducts}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Customers</div>
          <div className="stat-value">{totalCustomers}</div>
        </div>
      </div>

      <h3 className="serif" style={{ fontSize: "1.1rem", marginBottom: 16 }}>Recent Orders</h3>
      <div className="table-scroll"><table className="admin-table">
        <thead>
          <tr><th>Order</th><th>Customer</th><th>Status</th><th>Total</th><th>Date</th></tr>
        </thead>
        <tbody>
          {recentOrders.map((o: any) => (
            <tr key={o.id}>
              <td><Link href={`/admin/orders/${o.id}`}>#{o.id.slice(0, 8).toUpperCase()}</Link></td>
              <td>{o.contact_email}</td>
              <td><span className={`status-pill status-${o.status}`}>{o.status}</span></td>
              <td>${Number(o.total_usd).toFixed(2)}</td>
              <td>{new Date(o.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
          {recentOrders.length === 0 && (
            <tr><td colSpan={5} style={{ color: "var(--charcoal-soft)" }}>No orders yet.</td></tr>
          )}
        </tbody>
      </table></div>
    </div>
  );
}
