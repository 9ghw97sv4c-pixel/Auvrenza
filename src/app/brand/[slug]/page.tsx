import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import Link from "next/link";
import { getProductsByBrand, getAllBrands, getBrandStats } from "@/lib/data";

interface Props {
  params: { slug: string };
}

// Brand slug is just the lowercased brand name with spaces -> hyphens for URL friendliness,
// but we store the original brand name. We resolve by matching case-insensitively.
function brandFromSlug(slug: string, brands: string[]): string | null {
  const normalized = slug.replace(/-/g, " ").toLowerCase();
  return brands.find((b) => b.toLowerCase() === normalized) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const brands = await getAllBrands();
  const brand = brandFromSlug(params.slug, brands);
  if (!brand) return { title: "Brand not found" };
  return {
    title: `${brand} — Korean Skincare`,
    description: `Shop authentic ${brand} products at AUVRENZA. Premium Korean beauty — moisturizers, sunscreens, serums and more.`,
  };
}

export default async function BrandPage({ params }: Props) {
  const brands = await getAllBrands();
  const brand = brandFromSlug(params.slug, brands);
  if (!brand) notFound();

  const [products, stats] = await Promise.all([
    getProductsByBrand(brand),
    getBrandStats(brand),
  ]);

  return (
    <main className="section" style={{ paddingTop: 150 }}>
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">Brand</span>
          <h1>{brand}</h1>
          <p>
            {stats.count} product{stats.count === 1 ? "" : "s"}
            {stats.avgRating > 0 && ` · Avg. rating ${stats.avgRating}★`}
          </p>
          <div style={{ marginTop: 16 }}>
            <Link href={`/shop?brand=${encodeURIComponent(brand)}`} className="btn btn-outline" style={{ marginRight: 12 }}>
              Filter in Shop
            </Link>
            <Link href="/shop" className="btn btn-ghost">
              All Products
            </Link>
          </div>
        </div>

        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <p style={{ textAlign: "center", opacity: 0.7, marginTop: 48 }}>
            No products available for this brand yet.
          </p>
        )}
      </div>
    </main>
  );
}
