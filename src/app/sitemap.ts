import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = createClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("slug").eq("is_active", true),
    supabase.from("categories").select("slug"),
  ]);

  const staticRoutes = ["", "/shop", "/contact", "/privacy", "/terms", "/shipping", "/returns"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));

  const productRoutes = (products ?? []).map((p: any) => ({
    url: `${base}/product/${p.slug}`,
    lastModified: new Date(),
  }));

  const categoryRoutes = (categories ?? []).map((c: any) => ({
    url: `${base}/category/${c.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
