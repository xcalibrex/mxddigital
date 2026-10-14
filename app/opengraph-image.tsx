import { ImageResponse } from "next/og";
import { LOGO_PATH } from "@/lib/logo";

// Link preview card for Messages, WhatsApp, Facebook, LinkedIn, X etc. Rendered once at build.
export const alt = "MXD Digital: more leads for tradies";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ORANGE = "#ff991c";
const BONE = "#f0ece4";

/** Pull a TTF from Google Fonts (an old user agent gets TTF, which the renderer needs). */
async function font(family: string, weight: number) {
  const css = await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`, {
    headers: { "User-Agent": "Mozilla/4.0" },
  }).then((r) => r.text());
  const url = css.match(/url\((https:[^)]+\.ttf)\)/)?.[1];
  if (!url) throw new Error(`No TTF for ${family} ${weight}`);
  return fetch(url).then((r) => r.arrayBuffer());
}

export default async function OpengraphImage() {
  const [display, body] = await Promise.all([font("Unbounded", 500), font("DM+Sans", 600)]);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "radial-gradient(90% 70% at 50% 115%, rgba(255,153,28,0.45), #000 62%)",
          color: BONE,
          fontFamily: "DM Sans",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="56" height="56" viewBox="0 0 1024 1024">
            <path fill={ORANGE} fillRule="evenodd" d={LOGO_PATH} />
          </svg>
          <div style={{ display: "flex", fontFamily: "Unbounded", fontSize: 34, letterSpacing: "-0.02em" }}>
            M<span style={{ color: ORANGE }}>X</span>D DIGITAL
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", fontFamily: "Unbounded", fontSize: 92, lineHeight: 1.04, letterSpacing: "-0.045em" }}>
          <div style={{ display: "flex" }}>More leads for</div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", background: ORANGE, color: "#000", padding: "0 22px 8px", borderRadius: 14 }}>tradies</div>
            <span style={{ marginLeft: 6 }}>.</span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 28, color: "#bdb8ad" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span>Ads that pay for themselves.</span>
            <span>Websites that convert.</span>
          </div>
          <div style={{ display: "flex", fontSize: 24, letterSpacing: "0.18em", color: BONE }}>MXDDIGITAL.COM</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Unbounded", data: display, weight: 500, style: "normal" },
        { name: "DM Sans", data: body, weight: 600, style: "normal" },
      ],
    },
  );
}
