"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/lib/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const SKIN_TYPES = ["Dry", "Oily", "Combination", "Sensitive", "Normal"];

function categoryName(c: Category, locale: string): string {
  const key = `name_${locale}` as keyof Category;
  return (c[key] as string) || c.name_en;
}

export default function ShopFilters({
  categories,
  brands = [],
}: {
  categories: Category[];
  brands?: string[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const { locale } = useLocale();

  function updateParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/shop?${next.toString()}`);
  }

  const activeCategory = params.get("category");
  const activeBrand = params.get("brand");
  const activeSkin = params.get("skinType");
  const activeSort = params.get("sort") ?? "newest";

  return (
    <aside>
      <div className="filter-group">
        <h4>Category</h4>
        <label className="filter-option">
          <input type="radio" name="category" checked={!activeCategory} onChange={() => updateParam("category", null)} />
          All
        </label>
        {categories.map((c) => (
          <label className="filter-option" key={c.id}>
            <input
              type="radio"
              name="category"
              checked={activeCategory === c.slug}
              onChange={() => updateParam("category", c.slug)}
            />
            {categoryName(c, locale)}
          </label>
        ))}
      </div>

      {brands.length > 0 && (
        <div className="filter-group">
          <h4>Brand</h4>
          <label className="filter-option">
            <input type="radio" name="brand" checked={!activeBrand} onChange={() => updateParam("brand", null)} />
            All Brands
          </label>
          {brands.map((b) => (
            <label className="filter-option" key={b}>
              <input
                type="radio"
                name="brand"
                checked={activeBrand === b}
                onChange={() => updateParam("brand", b)}
              />
              {b}
            </label>
          ))}
        </div>
      )}

      <div className="filter-group">
        <h4>Skin Type</h4>
        <label className="filter-option">
          <input type="radio" name="skinType" checked={!activeSkin} onChange={() => updateParam("skinType", null)} />
          All
        </label>
        {SKIN_TYPES.map((s) => (
          <label className="filter-option" key={s}>
            <input type="radio" name="skinType" checked={activeSkin === s} onChange={() => updateParam("skinType", s)} />
            {s}
          </label>
        ))}
      </div>

      <div className="filter-group">
        <h4>Sort By</h4>
        <select className="sort-select" value={activeSort} onChange={(e) => updateParam("sort", e.target.value)}>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>
    </aside>
  );
}
