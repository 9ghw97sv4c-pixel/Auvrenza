"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="section" style={{ paddingTop: 180, minHeight: "70vh", textAlign: "center" }}>
      <div className="wrap">
        <span className="eyebrow">Something went wrong</span>
        <h1 className="serif" style={{ fontSize: "2.2rem", marginBottom: 20 }}>We hit a snag</h1>
        <p style={{ color: "var(--charcoal-soft)", fontWeight: 300, marginBottom: 36, maxWidth: "42ch", marginLeft: "auto", marginRight: "auto" }}>
          Something unexpected happened on our end. Please try again — if it keeps happening, reach out to hello@avelis.com.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn btn-dark" onClick={reset}>Try Again</button>
          <a className="btn btn-outline" href="/">Return Home</a>
        </div>
      </div>
    </main>
  );
}
