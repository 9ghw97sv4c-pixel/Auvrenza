import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import ProductGrid from "@/components/ProductGrid";
import Reveal from "@/components/Reveal";
import { getProductBySlug, getRelatedProducts } from "@/lib/data";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return {};
  return {
    title: product.name_en,
    description: product.description_en ?? `${product.name_en} by ${product.brand} — premium Korean skincare from AVELIS.`,
    openGraph: {
      title: product.name_en,
      description: product.description_en ?? "",
      images: product.images?.length ? product.images : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.category_id, product.id, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name_en,
    brand: product.brand,
    description: product.description_en,
    sku: product.sku,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: product.price_usd,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    aggregateRating: product.review_count > 0 ? {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.review_count,
    } : undefined,
  };

  return (
    <main className="section" style={{ paddingTop: 150, paddingBottom: 120 }}>
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        // JSON.stringify does not escape "</script>" — without this replace, a
        // product field containing that literal sequence could close this tag
        // early and inject arbitrary markup into every visitor's page. Product
        // fields are admin-only, but this is served to every public visitor.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="wrap">
        <ProductDetail product={product} />

        {related.length > 0 && (
          <div style={{ marginTop: 120 }}>
            <Reveal>
              <div className="section-head">
                <span className="eyebrow">You May Also Like</span>
                <h2>Complete the Ritual</h2>
              </div>
            </Reveal>
            <ProductGrid products={related} />
          </div>
        )}
      </div>
    </main>
  );
}
