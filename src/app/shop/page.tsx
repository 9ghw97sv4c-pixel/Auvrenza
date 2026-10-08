import type { Metadata } from "next";
import ProductGrid from "@/components/ProductGrid";
import ShopFilters from "@/components/ShopFilters";
import { getCategories, getShopProducts, getAllBrands } from "@/lib/data";

export const metadata: Metadata = {
  title: "Shop All Products",
  description: "Browse the full AUVRENZA catalogue — cleansers, serums, moisturizers, sunscreens, makeup and Korean beauty brands including Anua.",
};

interface Props {
  searchParams: {
    category?: string;
    brand?: string;
    q?: string;
    filter?: string;
    skinType?: string;
    sort?: "price-asc" | "price-desc" | "newest" | "rating";
  };
}

export default async function ShopPage({ searchParams }: Props) {
  const [categories, brands, products] = await Promise.all([
    getCategories(),
    getAllBrands(),
    getShopProducts({
      categorySlug: searchParams.category,
      brand: searchParams.brand,
      q: searchParams.q,
      bestsellerOnly: searchParams.filter === "bestseller",
      skinType: searchParams.skinType,
      sort: searchParams.sort,
    }),
  ]);

  const title = searchParams.brand
    ? `${searchParams.brand} Products`
    : searchParams.q
      ? `Results for "${searchParams.q}"`
      : searchParams.category
        ? categories.find((c) => c.slug === searchParams.category)?.name_en || "Category"
        : "All Products";

  return (
    <main className="section" style={{ paddingTop: 150 }}>
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">Shop</span>
          <h1>{title}</h1>
          <p>{products.length} product{products.length === 1 ? "" : "s"}</p>
        </div>

        <div className="shop-layout">
          <ShopFilters categories={categories} brands={brands} />
          <ProductGrid products={products} />
        </div>
      </div>
    </main>
  );
}
