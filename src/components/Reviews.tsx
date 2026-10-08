import Reveal from "./Reveal";

const reviews = [
  { name: "Sooyeon P.", loc: "Seoul, KR", text: "AUVRENZA is the first place I've trusted for authentic Korean skincare while living abroad. My skin has never looked better.", rating: 5 },
  { name: "Amelia R.", loc: "London, UK", text: "The Centella serum calmed my redness within two weeks. The packaging alone feels like a luxury unboxing.", rating: 5 },
  { name: "Haruto K.", loc: "Osaka, JP", text: "Considered, quiet, effective — everything I want from a skincare brand. The night routine set is now permanent.", rating: 4 },
];

export default function Reviews() {
  return (
    <section className="section" id="reviews">
      <div className="wrap">
        <Reveal>
          <div className="rating-summary">
            <div className="rating-num">4.9</div>
            <div>
              <div className="rating-stars">★★★★★</div>
              <div className="rating-sub">Based on 2,384 verified reviews</div>
            </div>
          </div>
        </Reveal>
        <div className="review-grid">
          {reviews.map((r) => (
            <Reveal key={r.name}>
              <div className="review-card">
                <div className="review-stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                <p>&quot;{r.text}&quot;</p>
                <div className="review-who">
                  <div className="review-avatar">{r.name[0]}</div>
                  <div>
                    <div className="review-name">{r.name}</div>
                    <div className="review-loc">{r.loc}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
