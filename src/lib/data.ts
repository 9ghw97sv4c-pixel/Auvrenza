import { createClient } from "@/lib/supabase/server";
import type { Product, Category } from "@/lib/types";

export async function getCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data } = await supabase.from("categories").select("*").order("sort_order");
  return data ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = createClient();
  const { data } = await supabase.from("categories").select("*").eq("slug", slug).single();
  return data ?? null;
}

export async function getBestsellers(limit = 4): Promise<Product[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("is_bestseller", true)
    .limit(limit);
  return data ?? [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createClient();
  const { data } = await supabase.from("products").select("*").eq("slug", slug).eq("is_active", true).single();
  return data ?? null;
}

export async function getRelatedProducts(categoryId: string | null, excludeId: string, limit = 4): Promise<Product[]> {
  const supabase = createClient();
  let query = supabase.from("products").select("*").eq("is_active", true).neq("id", excludeId).limit(limit);
  if (categoryId) query = query.eq("category_id", categoryId);
  const { data } = await query;
  return data ?? [];
}

interface ShopFilters {
  categorySlug?: string;
  brand?: string;
  q?: string;
  bestsellerOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  skinType?: string;
  sort?: "price-asc" | "price-desc" | "newest" | "rating";
}

export async function getShopProducts(filters: ShopFilters): Promise<Product[]> {
  const supabase = createClient();

  // Only bring in the categories join when we actually need to filter by it —
  // an unconditional `categories!inner(slug)` would silently drop every
  // uncategorized product (category_id null) from "all products" views.
  let query = filters.categorySlug
    ? supabase.from("products").select("*, categories!inner(slug)").eq("categories.slug", filters.categorySlug)
    : supabase.from("products").select("*");

  query = query.eq("is_active", true);
  if (filters.brand) query = query.eq("brand", filters.brand);
  if (filters.bestsellerOnly) query = query.eq("is_bestseller", true);
  if (filters.q) query = query.ilike("name_en", `%${filters.q}%`);
  if (filters.minPrice !== undefined) query = query.gte("price_usd", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("price_usd", filters.maxPrice);
  if (filters.skinType) query = query.contains("skin_type", [filters.skinType]);

  switch (filters.sort) {
    case "price-asc": query = query.order("price_usd", { ascending: true }); break;
    case "price-desc": query = query.order("price_usd", { ascending: false }); break;
    case "rating": query = query.order("rating", { ascending: false }); break;
    default: query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) {
    // Last-resort fallback so the shop page never hard-fails — logs would show the real cause.
    console.error("getShopProducts query failed, falling back to unfiltered list:", error.message);
    const fallback = await supabase.from("products").select("*").eq("is_active", true);
    return fallback.data ?? [];
  }
  return (data as unknown as Product[]) ?? [];
}

export async function getAllBrands(): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase.from("products").select("brand").eq("is_active", true);
  const brands = Array.from(new Set((data ?? []).map((p: any) => p.brand as string).filter(Boolean)));
  return brands.sort((a, b) => a.localeCompare(b));
}

export async function getProductsByBrand(brand: string, limit?: number): Promise<Product[]> {
  const supabase = createClient();
  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("brand", brand)
    .order("is_bestseller", { ascending: false })
    .order("rating", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data } = await query;
  return data ?? [];
}

export async function getBrandStats(brand: string): Promise<{ count: number; avgRating: number }> {
  const products = await getProductsByBrand(brand);
  if (products.length === 0) return { count: 0, avgRating: 0 };
  const avg = products.reduce((s, p) => s + (p.rating || 0), 0) / products.length;
  return { count: products.length, avgRating: Math.round(avg * 10) / 10 };
}
