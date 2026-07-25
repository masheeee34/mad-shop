import { ImageResponse } from "next/og";

/**
 * Vignette de partage générée à la compilation.
 * C'est ce visuel qui s'affiche sur WhatsApp, Instagram, LinkedIn et dans
 * les aperçus d'annonces : sans lui, les plateformes tirent une image au
 * hasard de la page, souvent illisible.
 */

export const alt = "MAD Shop — La qualité à petit prix";
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
          background: "#0b0b0c",
          padding: 72,
          position: "relative",
        }}
      >
        {/* Halo doré */}
        <div
          style={{
            position: "absolute",
            top: -240,
            left: -160,
            width: 720,
            height: 720,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(198,164,106,0.20) 0%, rgba(11,11,12,0) 70%)",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              fontSize: 44,
              fontWeight: 800,
              letterSpacing: -2,
              color: "#f4f1ea",
              display: "flex",
            }}
          >
            MAD&nbsp;<span style={{ color: "#c6a46a" }}>SHOP</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 92,
              fontWeight: 800,
              letterSpacing: -4,
              lineHeight: 1,
              color: "#f4f1ea",
              textTransform: "uppercase",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>La qualité</span>
            <span style={{ color: "#c6a46a" }}>à petit prix</span>
          </div>
          <div style={{ fontSize: 30, color: "#a29c92", display: "flex" }}>
            Audio · Sécurité · Objets connectés — livrés en 24-48 h
          </div>
        </div>

        {/* Signature tricolore */}
        <div style={{ display: "flex", height: 8, width: 320 }}>
          <div style={{ flex: 1, background: "#1f9b52" }} />
          <div style={{ flex: 1, background: "#f4f1ea" }} />
          <div style={{ flex: 1, background: "#d23f42" }} />
        </div>
      </div>
    ),
    size,
  );
}
