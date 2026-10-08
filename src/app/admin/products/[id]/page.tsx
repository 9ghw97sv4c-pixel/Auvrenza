import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const admin = createAdminClient();
  const [{ data: product }, { data: categories }] = await Promise.all([
    admin.from("products").select("*").eq("id", params.id).single(),
    admin.from("categories").select("*").order("sort_order"),
  ]);

  if (!product) notFound();

  return (
    <div>
      <div className="admin-header">
        <h1 className="serif" style={{ fontSize: "1.6rem" }}>Edit Product</h1>
      </div>
      <ProductForm categories={categories ?? []} product={product} />
    </div>
  );
}
