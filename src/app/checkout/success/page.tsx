"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/cart-store";
import type { Order } from "@/lib/types";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const cart = useCartStore();

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    const supabase = createClient();
    supabase
      .from("orders")
      .select("*")
      .eq("stripe_session_id", sessionId)
      .single()
      .then(({ data }) => {
        setOrder(data);
        setLoading(false);
        cart.init(); // refresh — webhook should have cleared it
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <main className="section" style={{ paddingTop: 180, minHeight: "60vh" }}>
      <div className="wrap" style={{ maxWidth: 560, textAlign: "center" }}>
        {loading && <p style={{ color: "var(--charcoal-soft)" }}>Confirming your order…</p>}

        {!loading && order && (
          <>
            <span className="eyebrow" style={{ display: "block", textAlign: "center" }}>Thank You</span>
            <h1 className="serif" style={{ fontSize: "2rem", marginBottom: 20 }}>Your ritual is on its way</h1>
            <p style={{ color: "var(--charcoal-soft)", marginBottom: 30, fontWeight: 300 }}>
              Order confirmation has been sent to {order.contact_email}. Order #{order.id.slice(0, 8).toUpperCase()}.
            </p>
            <Link className="btn btn-dark" href="/shop">Continue Shopping</Link>
          </>
        )}

        {!loading && !order && (
          <>
            <h1 className="serif" style={{ fontSize: "1.8rem", marginBottom: 16 }}>We couldn&apos;t find that order</h1>
            <p style={{ color: "var(--charcoal-soft)", marginBottom: 30 }}>If you completed payment, check your email for confirmation — the order may still be finalizing.</p>
            <Link className="btn btn-dark" href="/">Return Home</Link>
          </>
        )}
      </div>
    </main>
  );
}
