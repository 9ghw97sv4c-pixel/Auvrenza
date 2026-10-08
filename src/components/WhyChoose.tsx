import Reveal from "./Reveal";

const items = [
  { title: "100% Authentic", desc: "Genuine Korean products from Anua, Round Lab, COSRX, Torriden and trusted brands.", icon: "M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
  { title: "Delivery in Uzbekistan", desc: "Fast and reliable delivery across Tashkent and all regions of Uzbekistan.", icon: "M3 7h11v9H3zM14 10h4l3 3v3h-7z M6.5 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17.5 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" },
  { title: "Easy Payments", desc: "Payme, Click, Uzum or Cash on Delivery — choose what is convenient for you.", icon: "M4 10h16v9H4zM8 10V7a4 4 0 0 1 8 0v3" },
  { title: "Carefully Selected", desc: "Only proven formulas that work for real skin concerns.", icon: "M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" },
  { title: "Helpful Support", desc: "Ask us on Telegram or Instagram — we help you choose the right products.", icon: "M21 11.5a8.4 8.4 0 0 1-8.9 8.4A8.5 8.5 0 1 1 21 11.5z" },
  { title: "Fresh Stock", desc: "We regularly import new batches so you always get fresh products.", icon: "M12 2l7 4v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z" },
];

export default function WhyChoose() {
  return (
    <section className="section" style={{ background: "var(--ivory)" }}>
      <div className="wrap">
        <Reveal>
          <div className="section-head center" style={{ marginLeft: "auto", marginRight: "auto" }}>
            <span className="eyebrow">Why AUVRENZA</span>
            <h2>Why Choose Us</h2>
          </div>
        </Reveal>
      </div>
      <div className="wrap">
        <Reveal>
          <div className="why-grid">
            {items.map((w) => (
              <div className="why-card" key={w.title}>
                <svg viewBox="0 0 24 24"><path d={w.icon} /></svg>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
