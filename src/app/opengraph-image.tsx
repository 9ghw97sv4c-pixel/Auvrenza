import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AVELIS — Premium Korean Skincare";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(155deg, #F8F6F3 0%, #EFE8DD 55%, #C9A96A 140%)",
        }}
      >
        <div
          style={{
            fontSize: 96,
            letterSpacing: 14,
            color: "#222222",
            fontFamily: "serif",
            fontWeight: 500,
          }}
        >
          AVELIS
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 28,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#A6813F",
            fontFamily: "sans-serif",
          }}
        >
          Premium Korean Skincare
        </div>
      </div>
    ),
    { ...size }
  );
}
