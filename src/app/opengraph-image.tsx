import { ImageResponse } from "next/og";
import { profile, system } from "@/lib/content";

/**
 * Generated Open Graph / Twitter card (1200×630). Next picks this up by file
 * convention and wires og:image + twitter:image automatically — no static asset
 * to keep in sync. Rendered as a miniature of the instrument: dark surface, one
 * amber signal, identity. Everything is sourced from content.ts.
 */
export const alt = `${profile.name} — ${profile.role}`;
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
          justifyContent: "space-between",
          backgroundColor: "#0d0f14",
          padding: "72px",
          fontFamily: "sans-serif",
          color: "#e9e6df",
        }}
      >
        {/* top chrome — the status line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: 26,
            color: "#b8b3a9",
          }}
        >
          <div style={{ width: 14, height: 14, borderRadius: 999, backgroundColor: "#f4a83a" }} />
          <div style={{ display: "flex", letterSpacing: 4 }}>{system.name}</div>
          <div style={{ display: "flex", marginLeft: "auto", color: "#9b958a" }}>
            {system.version}
          </div>
        </div>

        {/* identity */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 100,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1,
            }}
          >
            {profile.name}
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 36, color: "#b8b3a9" }}>
            {profile.role}
          </div>
        </div>

        {/* bottom status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: 26,
            color: "#f4a83a",
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: 999, backgroundColor: "#f4a83a" }} />
          <div style={{ display: "flex" }}>
            {profile.available ? profile.availableLabel : profile.location}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
