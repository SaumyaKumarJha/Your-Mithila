import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "YourMithila — Property & Jobs in Madhubani Bihar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background:
            "linear-gradient(135deg, #1E0A3C 0%, #4C1D95 50%, #1E0A3C 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 72, marginBottom: 16 }}>🏠</div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "white",
            marginBottom: 12,
          }}
        >
          YourMithila
        </div>
        <div
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.75)",
            marginBottom: 8,
          }}
        >
          Property &amp; Jobs in Madhubani, Bihar
        </div>
        <div style={{ fontSize: 20, color: "rgba(255,255,255,0.5)" }}>
          मिथिला का अपना डिजिटल मंच • yourmithila.in
        </div>
      </div>
    ),
    { ...size }
  );
}
