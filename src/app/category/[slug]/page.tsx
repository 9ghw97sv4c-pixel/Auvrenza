import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import { getCategoryBySlug, getShopProducts } from "@/lib/data";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  if (!category) return {};
  return {
    title: category.name_en,
    description: category.description_en ?? `Shop ${category.name_en} at AVELIS — premium Korean skincare.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) notFound();

  const products = await getShopProducts({ categorySlug: params.slug });

  return (
    <main className="section" style={{ paddingTop: 150 }}>
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">Category</span>
          <h1>{category.name_en}</h1>
          {category.description_en && <p>{category.description_en}</p>}
        </div>
        <ProductGrid products={products} />
      </div>
    </main>
  );
}
