import Hero from "@/components/Hero";
import CategoryGrid from "@/components/CategoryGrid";
import ProductGrid from "@/components/ProductGrid";
import BrandGrid from "@/components/BrandGrid";
import BrandStory from "@/components/BrandStory";
import WhyChoose from "@/components/WhyChoose";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import Collections from "@/components/Collections";
import Reviews from "@/components/Reviews";
import InstagramGrid from "@/components/InstagramGrid";
import Newsletter from "@/components/Newsletter";
import FAQ from "@/components/FAQ";
import Reveal from "@/components/Reveal";
import Link from "next/link";
import { getCategories, getBestsellers, getAllBrands } from "@/lib/data";

export default async function HomePage() {
  const [categories, bestsellers, brands] = await Promise.all([
    getCategories(),
    getBestsellers(4),
    getAllBrands(),
  ]);

  return (
    <>
      <Hero />

      <section className="section" id="categories">
        <div className="wrap">
          <Reveal>
            <div className="section-head">
              <span className="eyebrow">Shop by Category</span>
              <h2>Every Step of the Ritual</h2>
            </div>
          </Reveal>
        </div>
        <CategoryGrid categories={categories} />
      </section>

      {brands.length > 0 && (
        <section className="section" id="brands" style={{ background: "var(--ivory)" }}>
          <div className="wrap">
            <Reveal>
              <div className="section-head">
                <span className="eyebrow">Shop by Brand</span>
                <h2>Popular Korean Brands</h2>
                <p>Anua, Round Lab, COSRX, Torriden, Axis-Y and more — authentic products for Uzbekistan.</p>
              </div>
            </Reveal>
          </div>
          <BrandGrid brands={brands} />
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link className="btn btn-outline" href="/shop">Browse All Brands in Shop</Link>
          </div>
        </section>
      )}

      <section className="section" id="bestsellers">
        <div className="wrap">
          <Reveal>
            <div className="section-head">
              <span className="eyebrow">Best Sellers</span>
              <h2>Loved by Thousands</h2>
              <p>The formulas our customers reach for again and again.</p>
            </div>
          </Reveal>
          <ProductGrid products={bestsellers} />
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <Link className="btn btn-outline" href="/shop">View All Products</Link>
          </div>
        </div>
      </section>

      <BrandStory />
      <WhyChoose />
      <BeforeAfterSlider />
      <Collections />
      <Reviews />
      <InstagramGrid />
      <Newsletter />
      <FAQ />
    </>
  );
}
