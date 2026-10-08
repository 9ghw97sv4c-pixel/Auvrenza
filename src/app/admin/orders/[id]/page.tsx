import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { updateOrderStatus } from "@/lib/actions/admin";
import type { OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = ["pending", "paid", "fulfilled", "cancelled", "refunded"];

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const admin = createAdminClient();
  const [{ data: order }, { data: items }] = await Promise.all([
    admin.from("orders").select("*").eq("id", params.id).single(),
    admin.from("order_items").select("*").eq("order_id", params.id),
  ]);

  if (!order) notFound();

  async function handleStatusChange(formData: FormData) {
    "use server";
    const status = formData.get("status") as OrderStatus;
    await updateOrderStatus(params.id, status);
  }

  const address = order.shipping_address as Record<string, string> | null;

  return (
    <div>
      <div className="admin-header">
        <h1 className="serif" style={{ fontSize: "1.6rem" }}>Order #{order.id.slice(0, 8).toUpperCase()}</h1>
        <span className={`status-pill status-${order.status}`}>{order.status}</span>
      </div>

      <div className="split-layout">
        <div>
          <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", padding: 24, marginBottom: 24 }}>
            <h3 className="serif" style={{ fontSize: "1.05rem", marginBottom: 16 }}>Items</h3>
            <div className="table-scroll"><table className="admin-table">
              <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Line Total</th></tr></thead>
              <tbody>
                {(items ?? []).map((it: any) => (
                  <tr key={it.id}>
                    <td>{it.product_name}</td>
                    <td>{it.quantity}</td>
                    <td>${Number(it.unit_price_usd).toFixed(2)}</td>
                    <td>${(Number(it.unit_price_usd) * it.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>

          <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", padding: 24 }}>
            <h3 className="serif" style={{ fontSize: "1.05rem", marginBottom: 16 }}>Shipping Address</h3>
            {address ? (
              <p style={{ fontSize: "0.9rem", lineHeight: 1.8 }}>
                {address.fullName}<br />
                {address.line1}<br />
                {address.city}, {address.postalCode}<br />
                {address.country}
              </p>
            ) : (
              <p style={{ color: "var(--charcoal-soft)" }}>No address on file.</p>
            )}
          </div>
        </div>

        <div>
          <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", padding: 24, marginBottom: 24 }}>
            <h3 className="serif" style={{ fontSize: "1.05rem", marginBottom: 16 }}>Summary</h3>
            <div style={{ fontSize: "0.88rem", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Subtotal</span><span>${Number(order.subtotal_usd).toFixed(2)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Discount</span><span>−${Number(order.discount_usd).toFixed(2)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Shipping</span><span>${Number(order.shipping_usd).toFixed(2)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, borderTop: "1px solid var(--line)", paddingTop: 8, marginTop: 4 }}>
                <span>Total</span><span>${Number(order.total_usd).toFixed(2)}</span>
              </div>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--charcoal-soft)", marginTop: 16 }}>Customer: {order.contact_email}</p>
            {order.coupon_code && <p style={{ fontSize: "0.8rem", color: "var(--charcoal-soft)" }}>Coupon: {order.coupon_code}</p>}
          </div>

          <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", padding: 24 }}>
            <h3 className="serif" style={{ fontSize: "1.05rem", marginBottom: 16 }}>Update Status</h3>
            <form action={handleStatusChange}>
              <select name="status" defaultValue={order.status} className="sort-select" style={{ width: "100%", marginBottom: 14 }}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button className="btn btn-dark btn-sm" type="submit" style={{ width: "100%", justifyContent: "center" }}>
                Save Status
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
