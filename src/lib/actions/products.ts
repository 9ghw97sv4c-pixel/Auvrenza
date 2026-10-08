"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/require-admin";

export interface ProductFormData {
  slug: string;
  brand: string;
  name_en: string;
  name_ko?: string;
  name_uz?: string;
  name_ru?: string;
  description_en?: string;
  category_id?: string | null;
  price_usd: number;
  compare_at_price_usd?: number | null;
  sku?: string | null;
  stock: number;
  images?: string[];
  ingredients?: string;
  benefits?: string;
  skin_type?: string[];
  is_bestseller?: boolean;
  is_active?: boolean;
}

export async function createProduct(data: ProductFormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("products").insert(data);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function updateProduct(id: string, data: Partial<ProductFormData>) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("products").update(data).eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { ok: true, message: "Saved." };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("products").delete().eq("id", id);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function updateStock(id: string, stock: number) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("products").update({ stock }).eq("id", id);
  revalidatePath("/admin/inventory");
  revalidatePath("/shop");
}
