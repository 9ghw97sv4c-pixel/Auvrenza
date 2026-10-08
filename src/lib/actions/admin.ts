"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/require-admin";
import type { OrderStatus } from "@/lib/types";

// ---------- Categories ----------
export async function createCategory(data: { slug: string; name_en: string; name_ko?: string; name_uz?: string; name_ru?: string; description_en?: string; image_url?: string }) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("categories").insert(data);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { ok: true, message: "Category created." };
}

// ---------- Orders ----------
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("orders").update({ status }).eq("id", orderId);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

// ---------- Coupons ----------
export interface CouponFormData {
  code: string;
  type: "percent" | "fixed";
  value: number;
  active?: boolean;
  usage_limit?: number | null;
  expires_at?: string | null;
}

export async function createCoupon(data: CouponFormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("coupons").insert({ ...data, code: data.code.toUpperCase() });
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/coupons");
  return { ok: true, message: "Coupon created." };
}

export async function toggleCoupon(id: string, active: boolean) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("coupons").update({ active }).eq("id", id);
  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(id: string) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("coupons").delete().eq("id", id);
  revalidatePath("/admin/coupons");
}
