import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <p style={{ color: "var(--charcoal-soft)", fontSize: "0.9rem" }}>
        No products yet — add some in the Admin Dashboard → Products.
      </p>
    );
  }
  return (
    <div className="prod-grid">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} toneIndex={i} />
      ))}
    </div>
  );
}
