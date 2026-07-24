import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { isAuthed } from "@/lib/admin-auth";

export async function POST(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Nom de fichier propre et unique
    const cleanOriginalName = file.name.toLowerCase().replace(/[^a-z0-9.-]/g, "_");
    const safeName = `${Date.now()}_${cleanOriginalName}`;
    const uploadDir = path.join(process.cwd(), "public", "products");

    // Création du dossier public/products s'il n'existe pas
    await fs.mkdir(uploadDir, { recursive: true });

    // Écriture du fichier sur le disque
    const filePath = path.join(uploadDir, safeName);
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      filename: safeName,
      url: `/products/${safeName}`,
    });
  } catch (err) {
    console.error("[upload error]", err);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement de l'image." },
      { status: 500 }
    );
  }
}
