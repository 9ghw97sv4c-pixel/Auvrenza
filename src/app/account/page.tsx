"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser, signOut } from "@/lib/auth";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCurrency } from "@/lib/CurrencyProvider";
import type { Order } from "@/lib/types";

export default function AccountPage() {
  const { user, isLoading } = useUser();
  const { t } = useLocale();
  const { format } = useCurrency();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (!isLoading && !user) router.push("/");
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
      setOrders(data ?? []);
    });
    supabase.from("profiles").select("full_name").eq("id", user.id).single().then(({ data }) => {
      setFullName(data?.full_name ?? "");
    });
  }, [user]);

  if (!user) return null;

  return (
    <main className="section" style={{ paddingTop: 150 }}>
      <div className="wrap" style={{ maxWidth: 760 }}>
        <div className="section-head">
          <span className="eyebrow">{t.common.account}</span>
          <h1>{fullName ? `Welcome back, ${fullName.split(" ")[0]}` : "Your Account"}</h1>
          <p>{user.email}</p>
        </div>

        <button className="btn btn-outline btn-sm" onClick={async () => { await signOut(); router.push("/"); }} style={{ marginBottom: 50 }}>
          {t.auth.logout}
        </button>

        <h3 className="serif" style={{ fontSize: "1.2rem", marginBottom: 20 }}>Order History</h3>
        {orders.length === 0 && <p style={{ color: "var(--charcoal-soft)" }}>No orders yet.</p>}
        {orders.length > 0 && (
          <div className="table-scroll"><table className="admin-table">
            <thead>
              <tr><th>Order</th><th>Date</th><th>Status</th><th>Total</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id.slice(0, 8).toUpperCase()}</td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td><span className={`status-pill status-${o.status}`}>{o.status}</span></td>
                  <td>{format(o.total_usd)}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </main>
  );
}
