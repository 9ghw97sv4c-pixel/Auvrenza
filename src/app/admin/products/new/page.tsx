import { createAdminClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const admin = createAdminClient();
  const { data: categories } = await admin.from("categories").select("*").order("sort_order");

  return (
    <div>
      <div className="admin-header">
        <h1 className="serif" style={{ fontSize: "1.6rem" }}>New Product</h1>
      </div>
      <ProductForm categories={categories ?? []} />
    </div>
  );
}
