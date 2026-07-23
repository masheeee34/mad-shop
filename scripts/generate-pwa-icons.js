/**
 * Génération des icônes PWA depuis le logo existant.
 * Utilise sharp (inclus dans Next.js) — aucune IA.
 * Usage : node scripts/generate-pwa-icons.js
 */

const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const SRC = path.join(__dirname, "../public/brand/logo.png");
const OUT = path.join(__dirname, "../public/icons");

const SIZES = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
];

const PADDING_RATIO = 0.15; // 15% de padding pour le maskable

async function main() {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

  for (const { name, size } of SIZES) {
    const padding = Math.round(size * PADDING_RATIO);
    const innerSize = size - padding * 2;

    // Resize le logo avec padding (fond noir) — format maskable PWA
    await sharp(SRC)
      .resize(innerSize, innerSize, { fit: "contain", background: { r: 11, g: 11, b: 12, alpha: 1 } })
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 11, g: 11, b: 12, alpha: 1 },
      })
      .png()
      .toFile(path.join(OUT, name));

    console.log(`✓ ${name} (${size}x${size}px)`);
  }

  console.log(`\nIcones PWA générées dans public/icons/`);
}

main().catch((err) => {
  console.error("Erreur:", err.message);
  process.exit(1);
});
