"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct, type ProductFormData } from "@/lib/actions/products";
import type { Category, Product } from "@/lib/types";

const SKIN_TYPES = ["Dry", "Oily", "Combination", "Sensitive", "Normal"];

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function ProductForm({ categories, product }: { categories: Category[]; product?: Product }) {
  const router = useRouter();
  const isEdit = !!product;

  const [form, setForm] = useState<ProductFormData>({
    slug: product?.slug ?? "",
    brand: product?.brand ?? "AVELIS Lab",
    name_en: product?.name_en ?? "",
    name_ko: product?.name_ko ?? "",
    name_uz: product?.name_uz ?? "",
    name_ru: product?.name_ru ?? "",
    description_en: product?.description_en ?? "",
    category_id: product?.category_id ?? "",
    price_usd: product?.price_usd ?? 0,
    compare_at_price_usd: product?.compare_at_price_usd ?? undefined,
    sku: product?.sku ?? "",
    stock: product?.stock ?? 0,
    images: product?.images ?? [],
    ingredients: product?.ingredients ?? "",
    benefits: product?.benefits ?? "",
    skin_type: product?.skin_type ?? [],
    is_bestseller: product?.is_bestseller ?? false,
    is_active: product?.is_active ?? true,
  });
  const [imagesText, setImagesText] = useState((product?.images ?? []).join("\n"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleSkinType(type: string) {
    setForm((f) => ({
      ...f,
      skin_type: f.skin_type?.includes(type) ? f.skin_type.filter((t) => t !== type) : [...(f.skin_type ?? []), type],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const images = imagesText.split("\n").map((s) => s.trim()).filter(Boolean);
    // Empty strings must become null for uuid (category_id) and unique (sku) columns —
    // Postgres rejects "" as a uuid, and a second product with sku:"" would collide
    // with the unique constraint (NULL doesn't, but "" does).
    const payload = {
      ...form,
      images,
      slug: form.slug.trim() || slugify(form.name_en),
      category_id: form.category_id || null,
      sku: form.sku?.trim() || null,
    };
    try {
      if (isEdit && product) {
        const res = await updateProduct(product.id, payload);
        if (res && !res.ok) setError(res.message ?? "Could not save.");
        else router.push("/admin/products");
      } else {
        await createProduct(payload);
        // createProduct redirects on success
      }
    } catch (err: any) {
      // NEXT_REDIRECT throws internally on success — ignore that case
      if (!String(err?.message).includes("NEXT_REDIRECT")) {
        setError(err.message ?? "Could not save.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 640 }}>
      <div className="form-grid-2">
        <div className="form-field">
          <label>Name (English)</label>
          <input required value={form.name_en} onChange={(e) => update("name_en", e.target.value)} />
        </div>
        <div className="form-field">
          <label>Slug</label>
          <input placeholder="auto-generated if empty" value={form.slug} onChange={(e) => update("slug", e.target.value)} />
        </div>
      </div>

      <div className="form-grid-3">
        <div className="form-field">
          <label>Name (한국어)</label>
          <input value={form.name_ko} onChange={(e) => update("name_ko", e.target.value)} />
        </div>
        <div className="form-field">
          <label>Name (O&apos;zbek)</label>
          <input value={form.name_uz} onChange={(e) => update("name_uz", e.target.value)} />
        </div>
        <div className="form-field">
          <label>Name (Русский)</label>
          <input value={form.name_ru} onChange={(e) => update("name_ru", e.target.value)} />
        </div>
      </div>

      <div className="form-field">
        <label>Description</label>
        <textarea rows={3} value={form.description_en} onChange={(e) => update("description_en", e.target.value)} />
      </div>

      <div className="form-grid-2">
        <div className="form-field">
          <label>Brand</label>
          <input value={form.brand} onChange={(e) => update("brand", e.target.value)} />
        </div>
        <div className="form-field">
          <label>Category</label>
          <select value={form.category_id} onChange={(e) => update("category_id", e.target.value)}>
            <option value="">— None —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name_en}</option>)}
          </select>
        </div>
      </div>

      <div className="form-grid-3">
        <div className="form-field">
          <label>Price (USD)</label>
          <input type="number" step="0.01" required value={form.price_usd} onChange={(e) => update("price_usd", parseFloat(e.target.value))} />
        </div>
        <div className="form-field">
          <label>Compare-at Price</label>
          <input type="number" step="0.01" value={form.compare_at_price_usd ?? ""} onChange={(e) => update("compare_at_price_usd", e.target.value ? parseFloat(e.target.value) : null)} />
        </div>
        <div className="form-field">
          <label>Stock</label>
          <input type="number" required value={form.stock} onChange={(e) => update("stock", parseInt(e.target.value || "0"))} />
        </div>
      </div>

      <div className="form-field">
        <label>Image URLs (one per line — first is the main image)</label>
        <textarea
          rows={3}
          value={imagesText}
          onChange={(e) => setImagesText(e.target.value)}
          placeholder={"https://your-cdn.com/product-front.jpg\nhttps://your-cdn.com/product-side.jpg"}
        />
        {imagesText.trim() && (
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {imagesText.split("\n").map((s) => s.trim()).filter(Boolean).map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={url} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 4, border: "1px solid var(--line)" }} onError={(e) => (e.currentTarget.style.opacity = "0.25")} />
            ))}
          </div>
        )}
        <p style={{ fontSize: "0.75rem", color: "var(--charcoal-soft)", marginTop: 8 }}>
          Leave empty to show the brand&apos;s signature gradient placeholder instead.
        </p>
      </div>

      <div className="form-field">
        <label>SKU</label>
        <input value={form.sku} onChange={(e) => update("sku", e.target.value)} />
      </div>

      <div className="form-field">
        <label>Ingredients</label>
        <textarea rows={2} value={form.ingredients} onChange={(e) => update("ingredients", e.target.value)} />
      </div>
      <div className="form-field">
        <label>Benefits</label>
        <textarea rows={2} value={form.benefits} onChange={(e) => update("benefits", e.target.value)} />
      </div>

      <div className="form-field">
        <label>Skin Type</label>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {SKIN_TYPES.map((s) => (
            <label key={s} className="filter-option">
              <input type="checkbox" checked={form.skin_type?.includes(s)} onChange={() => toggleSkinType(s)} /> {s}
            </label>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
        <label className="filter-option">
          <input type="checkbox" checked={form.is_bestseller} onChange={(e) => update("is_bestseller", e.target.checked)} /> Bestseller
        </label>
        <label className="filter-option">
          <input type="checkbox" checked={form.is_active} onChange={(e) => update("is_active", e.target.checked)} /> Active (visible on storefront)
        </label>
      </div>

      {error && <p className="form-error">{error}</p>}

      <button className="btn btn-dark" type="submit" disabled={loading}>
        {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
      </button>
    </form>
  );
}
