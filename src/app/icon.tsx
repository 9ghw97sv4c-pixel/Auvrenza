import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#222222",
          borderRadius: "50%",
        }}
      >
        <span
          style={{
            fontSize: 34,
            color: "#C9A96A",
            fontFamily: "serif",
            fontWeight: 500,
          }}
        >
          A
        </span>
      </div>
    ),
    { ...size }
  );
}
