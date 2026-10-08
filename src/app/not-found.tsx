import Link from "next/link";

export default function NotFound() {
  return (
    <main className="section" style={{ paddingTop: 180, minHeight: "70vh", textAlign: "center" }}>
      <div className="wrap">
        <span className="eyebrow">404</span>
        <h1 className="serif" style={{ fontSize: "2.2rem", marginBottom: 20 }}>This page has wandered off</h1>
        <p style={{ color: "var(--charcoal-soft)", fontWeight: 300, marginBottom: 36, maxWidth: "42ch", marginLeft: "auto", marginRight: "auto" }}>
          The page you&apos;re looking for doesn&apos;t exist, or has moved. Let&apos;s get you back to the ritual.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link className="btn btn-dark" href="/">Return Home</Link>
          <Link className="btn btn-outline" href="/shop">Shop All Products</Link>
        </div>
      </div>
    </main>
  );
}
