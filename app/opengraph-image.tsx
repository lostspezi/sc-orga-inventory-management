import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SC Orga Manager — Star Citizen Organization Inventory";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
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
                    background: "linear-gradient(135deg, #070d14 0%, #0b1e2e 100%)",
                    position: "relative",
                }}
            >
                {/* Cyan accent line top */}
                <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 3,
                    background: "linear-gradient(90deg, transparent, #0eecff, transparent)",
                }} />

                {/* Eyebrow */}
                <p style={{
                    fontSize: 16, letterSpacing: "0.3em", textTransform: "uppercase",
                    color: "rgba(14,236,255,0.6)", fontFamily: "monospace", marginBottom: 16,
                }}>
                    SC ORGA MANAGER
                </p>

                {/* Main title */}
                <h1 style={{
                    fontSize: 64, fontWeight: 900, color: "#e0f0ff",
                    textAlign: "center", lineHeight: 1.2, margin: "0 80px 16px",
                }}>
                    Star Citizen Organization Inventory
                </h1>

                {/* Subtitle */}
                <p style={{
                    fontSize: 22, color: "rgba(200,220,232,0.6)",
                    textAlign: "center", margin: "0 120px",
                }}>
                    Manage inventory · Coordinate trades · Automate reports
                </p>

                {/* URL */}
                <p style={{
                    position: "absolute", bottom: 32,
                    fontSize: 16, color: "rgba(14,236,255,0.4)",
                    fontFamily: "monospace", letterSpacing: "0.15em",
                }}>
                    scoim.io
                </p>

                {/* Cyan accent line bottom */}
                <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, height: 3,
                    background: "linear-gradient(90deg, transparent, rgba(14,236,255,0.4), transparent)",
                }} />
            </div>
        ),
        { ...size }
    );
}
