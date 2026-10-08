"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateStock } from "@/lib/actions/products";
import type { Product } from "@/lib/types";

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [edits, setEdits] = useState<Record<string, number>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("products").select("*").order("stock", { ascending: true }).then(({ data }) => {
      setProducts(data ?? []);
    });
  }, []);

  async function save(id: string) {
    const value = edits[id];
    if (value === undefined) return;
    setSavingId(id);
    await updateStock(id, value);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock: value } : p)));
    setSavingId(null);
  }

  return (
    <div>
      <div className="admin-header">
        <h1 className="serif" style={{ fontSize: "1.6rem" }}>Inventory</h1>
      </div>

      <div className="table-scroll"><table className="admin-table">
        <thead>
          <tr><th>Product</th><th>SKU</th><th>Current Stock</th><th>New Stock</th><th></th></tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name_en}</td>
              <td>{p.sku ?? "—"}</td>
              <td>
                <span className={`status-pill ${p.stock === 0 ? "status-cancelled" : p.stock < 10 ? "status-pending" : "status-paid"}`}>
                  {p.stock} in stock
                </span>
              </td>
              <td>
                <input
                  type="number"
                  min={0}
                  defaultValue={p.stock}
                  onChange={(e) => setEdits((prev) => ({ ...prev, [p.id]: parseInt(e.target.value || "0") }))}
                  style={{ width: 90, border: "1px solid var(--line)", padding: "6px 10px", borderRadius: 2 }}
                />
              </td>
              <td>
                <button className="btn btn-outline btn-sm" onClick={() => save(p.id)} disabled={savingId === p.id}>
                  {savingId === p.id ? "…" : "Update"}
                </button>
              </td>
            </tr>
          ))}
          {products.length === 0 && <tr><td colSpan={5} style={{ color: "var(--charcoal-soft)" }}>No products yet.</td></tr>}
        </tbody>
      </table></div>
    </div>
  );
}
