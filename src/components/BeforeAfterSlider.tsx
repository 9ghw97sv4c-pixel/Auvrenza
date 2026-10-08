"use client";

import { useRef } from "react";
import Reveal from "./Reveal";

export default function BeforeAfterSlider() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const beforeRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  function setPos(pct: number) {
    const clamped = Math.max(2, Math.min(98, pct));
    if (beforeRef.current) beforeRef.current.style.clipPath = `inset(0 ${100 - clamped}% 0 0)`;
    if (handleRef.current) handleRef.current.style.left = clamped + "%";
  }

  function posFromEvent(e: React.MouseEvent | React.TouchEvent) {
    const rect = sliderRef.current!.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    return ((clientX - rect.left) / rect.width) * 100;
  }

  return (
    <section className="section">
      <div className="wrap">
        <Reveal>
          <div className="section-head center" style={{ marginLeft: "auto", marginRight: "auto" }}>
            <span className="eyebrow">Real Results</span>
            <h2>See the Difference</h2>
          </div>
        </Reveal>
        <Reveal>
          <div className="ba-wrap">
            <div
              className="ba-slider"
              ref={sliderRef}
              onMouseDown={(e) => { dragging.current = true; setPos(posFromEvent(e)); }}
              onMouseMove={(e) => { if (dragging.current) setPos(posFromEvent(e)); }}
              onMouseUp={() => (dragging.current = false)}
              onMouseLeave={() => (dragging.current = false)}
              onTouchStart={(e) => { dragging.current = true; setPos(posFromEvent(e)); }}
              onTouchMove={(e) => { if (dragging.current) setPos(posFromEvent(e)); }}
              onTouchEnd={() => (dragging.current = false)}
            >
              <div className="ba-after"><span className="ba-label after">After — 6 weeks</span></div>
              <div className="ba-before" ref={beforeRef} style={{ clipPath: "inset(0 50% 0 0)" }}>
                <span className="ba-label before">Before</span>
              </div>
              <div className="ba-handle" ref={handleRef} style={{ left: "50%" }} />
            </div>
            <p className="ba-caption">Drag to compare — results from the Glass Skin Collection, used consistently for 6 weeks.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
