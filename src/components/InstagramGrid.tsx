import Reveal from "./Reveal";

const tones = [
  "linear-gradient(135deg,#EFE8DD,#C9A96A)",
  "linear-gradient(135deg,#F8F6F3,#DED2B8)",
  "linear-gradient(135deg,#E9E2D4,#B99B62)",
  "linear-gradient(135deg,#F3EEE4,#CBB280)",
  "linear-gradient(135deg,#EEE7DA,#AE8C56)",
  "linear-gradient(135deg,#F6F1E8,#D6BE8E)",
];

export default function InstagramGrid() {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Reveal>
          <div className="section-head">
            <span className="eyebrow">@avelis.official</span>
            <h2>Join the Ritual</h2>
          </div>
        </Reveal>
      </div>
      <Reveal>
        <div className="insta-grid">
          {tones.map((t, i) => (
            <a key={i} href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="insta-card">
              <div className="insta-bg" style={{ background: t }} />
              <div className="insta-overlay">
                <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="white" /></svg>
              </div>
            </a>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
