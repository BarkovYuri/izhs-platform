import { ImageResponse } from "next/og";
import { getSettings } from "@/services/api";

export const runtime = "nodejs";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };
export const alt = "Ремстрой — кирпичные дома в Кисловке, Томск";

export default async function OG() {
  const s = await getSettings().catch(() => null);
  const siteName = s?.site_name || "Ремстрой";
  const tagline = s?.tagline || "Кирпичные дома в Кисловке, Томск";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: "72px 80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#1f1c18",
          background:
            "radial-gradient(60% 80% at 70% 0%, rgba(184,90,53,0.18), transparent 60%)," +
            "radial-gradient(50% 60% at 0% 100%, rgba(91,107,65,0.18), transparent 60%)," +
            "linear-gradient(180deg, #faf7f2 0%, #f0e6d2 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 64, height: 64, borderRadius: 14,
              background: "#b85a35", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 40, fontWeight: 900,
            }}
          >Р</div>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em" }}>
            {siteName}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{
            fontSize: 88, fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.03em",
            display: "flex", flexWrap: "wrap",
          }}>
            <span>Кирпичные дома</span>
          </div>
          <div style={{
            fontSize: 48, fontWeight: 800, color: "#b85a35", lineHeight: 1.0,
          }}>
            под ваш стиль жизни
          </div>
          <div style={{
            fontSize: 28, color: "#6a635a", marginTop: 6, fontWeight: 500,
          }}>
            {tagline}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{
            background: "rgba(184,90,53,0.10)", color: "#8c4126",
            padding: "10px 18px", borderRadius: 999, fontSize: 22, fontWeight: 700,
            border: "1px solid rgba(184,90,53,0.20)",
          }}>
            6 типовых проектов
          </div>
          <div style={{
            background: "rgba(91,107,65,0.10)", color: "#5b6b41",
            padding: "10px 18px", borderRadius: 999, fontSize: 22, fontWeight: 700,
            border: "1px solid rgba(91,107,65,0.20)",
          }}>
            Эскроу · Ипотека
          </div>
          <div style={{
            background: "rgba(31,28,24,0.06)", color: "#1f1c18",
            padding: "10px 18px", borderRadius: 999, fontSize: 22, fontWeight: 700,
          }}>
            remstroy70.ru
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
