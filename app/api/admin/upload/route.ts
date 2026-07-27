import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { isAuthed } from "@/lib/admin-auth";
import { enforceRateLimit } from "@/lib/rate-limit";

/** 5 Mo : largement suffisant pour une photo produit optimisée. */
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Types autorisés. Volontairement restreint aux formats matriciels :
 * le SVG est exclu car il peut embarquer du JavaScript, et un fichier servi
 * depuis notre propre domaine s'exécuterait dans notre origine.
 */
const ALLOWED = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
} as const;

type AllowedMime = keyof typeof ALLOWED;

/**
 * Détecte le vrai type d'un fichier par sa signature binaire.
 * On ne fait jamais confiance au `Content-Type` ni à l'extension annoncés
 * par le client : renommer un script en `.png` est trivial.
 */
function sniffMime(buf: Buffer): AllowedMime | null {
  if (buf.length < 12) return null;

  // JPEG : FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";

  // PNG : 89 50 4E 47 0D 0A 1A 0A
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "image/png";
  }

  // GIF : "GIF87a" ou "GIF89a"
  if (buf.subarray(0, 6).toString("ascii").match(/^GIF8[79]a$/)) return "image/gif";

  // Conteneur RIFF/ISO-BMFF : on lit la marque de format
  const riff = buf.subarray(0, 4).toString("ascii");
  const brand = buf.subarray(8, 12).toString("ascii");
  if (riff === "RIFF" && brand === "WEBP") return "image/webp";
  if (buf.subarray(4, 8).toString("ascii") === "ftyp" && /^(avif|avis)$/.test(brand)) {
    return "image/avif";
  }

  return null;
}

export async function POST(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const limited = enforceRateLimit(req, "admin-upload", 30, 60_000);
  if (limited) return limited;

  // Court-circuit avant de bufferiser quoi que ce soit.
  const declaredLength = Number(req.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BYTES + 4096) {
    return NextResponse.json(
      { error: "Image trop volumineuse (5 Mo maximum)." },
      { status: 413 },
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Aucun fichier fourni." }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "Fichier vide." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Image trop volumineuse (5 Mo maximum)." },
        { status: 413 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const mime = sniffMime(buffer);
    if (!mime) {
      return NextResponse.json(
        { error: "Format non supporté. Utilisez JPG, PNG, WebP, AVIF ou GIF." },
        { status: 415 },
      );
    }

    // Nom généré côté serveur pour éviter les collisions et injections
    const safeName = `${crypto.randomUUID()}.${ALLOWED[mime]}`;

    // Si on a le token Vercel Blob, on upload sur le Cloud
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import("@vercel/blob");
      
      const blob = await put(`products/${safeName}`, buffer, {
        access: "public",
        contentType: mime,
      });

      return NextResponse.json({
        success: true,
        filename: blob.url,
        url: blob.url,
      });
    }

    // Fallback local (développement ou hébergement classique type Hostinger)
    const uploadDir = process.env.UPLOAD_DIR
      ? path.resolve(process.env.UPLOAD_DIR)
      : path.join(process.cwd(), "public", "products");

    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, safeName), buffer);

    return NextResponse.json({
      success: true,
      filename: safeName,
      url: `/products/${safeName}`,
    });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement de l'image." },
      { status: 500 },
    );
  }
}
