"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory } from "@/lib/actions/admin";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function NewCategoryForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [nameEn, setNameEn] = useState("");
  const [nameKo, setNameKo] = useState("");
  const [nameUz, setNameUz] = useState("");
  const [nameRu, setNameRu] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) {
    return (
      <button className="btn btn-outline btn-sm" onClick={() => setOpen(true)} style={{ marginBottom: 24 }}>
        + New Category
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await createCategory({
      slug: slugify(nameEn),
      name_en: nameEn,
      name_ko: nameKo || undefined,
      name_uz: nameUz || undefined,
      name_ru: nameRu || undefined,
      image_url: imageUrl || undefined,
    });
    setLoading(false);
    if (!res.ok) {
      setError(res.message);
    } else {
      setNameEn(""); setNameKo(""); setNameUz(""); setNameRu(""); setImageUrl("");
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-inline-form" style={{ background: "#fff", borderRadius: "var(--radius-lg)", padding: 24, marginBottom: 24 }}>
      <div className="form-field" style={{ marginBottom: 0 }}>
        <label>Name (English)</label>
        <input required value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="Cleansers" />
      </div>
      <div className="form-field" style={{ marginBottom: 0 }}>
        <label>한국어</label>
        <input value={nameKo} onChange={(e) => setNameKo(e.target.value)} />
      </div>
      <div className="form-field" style={{ marginBottom: 0 }}>
        <label>O&apos;zbek</label>
        <input value={nameUz} onChange={(e) => setNameUz(e.target.value)} />
      </div>
      <div className="form-field" style={{ marginBottom: 0 }}>
        <label>Русский</label>
        <input value={nameRu} onChange={(e) => setNameRu(e.target.value)} />
      </div>
      <div className="form-field" style={{ marginBottom: 0, gridColumn: "1 / -1" }}>
        <label>Image URL (optional — shows AVELIS gradient if left empty)</label>
        <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://your-cdn.com/cleansers.jpg" />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-dark btn-sm" type="submit" disabled={loading}>{loading ? "…" : "Add"}</button>
        <button className="btn btn-outline btn-sm" type="button" onClick={() => setOpen(false)}>Cancel</button>
      </div>
      {error && <p className="form-error" style={{ gridColumn: "1 / -1" }}>{error}</p>}
    </form>
  );
}
