import Reveal from "./Reveal";

export default function BrandStory() {
  return (
    <section className="section" id="story">
      <div className="wrap story-grid">
        <Reveal><div className="story-media" /></Reveal>
        <Reveal>
          <div className="story-text">
            <div className="hairline left" />
            <span className="eyebrow">Our Story</span>
            <h2 style={{ fontSize: "2rem", marginBottom: 24 }}>A trusted bridge to Korean beauty</h2>
            <p>AUVRENZA began with a simple frustration — it was hard to know which Korean skincare was genuine, and which shelf had been sitting untouched too long.</p>
            <p>We built AUVRENZA to close that gap: every formula is sourced directly, verified for authenticity, and chosen because it earned a place in the ritual — not because it trended.</p>
            <p>What stays with you is quiet, radiant skin. That&apos;s the only metric we design around.</p>
            <a className="btn btn-outline" href="#reviews" style={{ marginTop: 10 }}>Read Our Reviews</a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
