export default function Loading() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        className="serif"
        style={{
          fontSize: "1.6rem",
          letterSpacing: "0.14em",
          color: "var(--charcoal)",
          opacity: 0.5,
          animation: "pulse-fade 1.6s ease-in-out infinite",
        }}
      >
        AVELIS
      </div>
      <style>{`
        @keyframes pulse-fade {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
