import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { deleteProduct } from "@/lib/actions/products";
import NewCategoryForm from "@/components/admin/NewCategoryForm";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const admin = createAdminClient();
  const { data: products } = await admin.from("products").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <div className="admin-header">
        <h1 className="serif" style={{ fontSize: "1.6rem" }}>Products</h1>
        <Link href="/admin/products/new" className="btn btn-dark btn-sm">+ New Product</Link>
      </div>

      <NewCategoryForm />

      <div className="table-scroll"><table className="admin-table">
        <thead>
          <tr><th>Name</th><th>Brand</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {(products ?? []).map((p: any) => (
            <tr key={p.id}>
              <td>{p.name_en}</td>
              <td>{p.brand}</td>
              <td>${Number(p.price_usd).toFixed(2)}</td>
              <td>{p.stock}</td>
              <td>
                <span className={`status-pill ${p.is_active ? "status-paid" : "status-cancelled"}`}>
                  {p.is_active ? "Active" : "Hidden"}
                </span>
              </td>
              <td style={{ display: "flex", gap: 10 }}>
                <Link href={`/admin/products/${p.id}`} style={{ fontSize: "0.8rem", textDecoration: "underline" }}>Edit</Link>
                <form action={deleteProduct.bind(null, p.id)}>
                  <button type="submit" style={{ background: "none", border: "none", fontSize: "0.8rem", color: "#a33", textDecoration: "underline" }}>
                    Delete
                  </button>
                </form>
              </td>
            </tr>
          ))}
          {(!products || products.length === 0) && (
            <tr><td colSpan={6} style={{ color: "var(--charcoal-soft)" }}>No products yet — create your first one.</td></tr>
          )}
        </tbody>
      </table></div>
    </div>
  );
}
