import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Persistance simple par fichiers JSON dans /data.
 * Zéro base de données : idéal pour un petit catalogue et un déploiement
 * Node sur Hostinger. Pour passer à l'échelle, on remplacera cette couche
 * par une vraie base (Postgres/MySQL) sans toucher au reste du code.
 */

export const DATA_DIR = process.env.VERCEL
  ? path.join("/tmp", "data")
  : process.env.DATA_DIR
    ? path.resolve(process.env.DATA_DIR)
    : path.join(process.cwd(), "data");

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

/** Lit un fichier JSON, ou renvoie `fallback` s'il n'existe pas encore. */
export async function readJSON<T>(file: string, fallback: T): Promise<T> {
  const full = path.join(DATA_DIR, file);
  try {
    const raw = await fs.readFile(full, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Écrit un fichier JSON (écriture atomique via fichier temporaire). */
export async function writeJSON<T>(file: string, data: T): Promise<void> {
  await ensureDir();
  const full = path.join(DATA_DIR, file);
  const tmp = `${full}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, full);
}

/** Petit identifiant lisible (ex: commande, avis). */
export function makeId(prefix = "") {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const time = Date.now().toString(36).toUpperCase().slice(-4);
  return `${prefix}${time}${rand}`;
}
