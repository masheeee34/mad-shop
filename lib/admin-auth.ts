import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";

/**
 * Authentification admin minimaliste : un mot de passe (ADMIN_PASSWORD) et
 * un cookie signé (HMAC). Suffisant pour un back-office d'une boutique.
 * En prod, définissez ADMIN_PASSWORD et ADMIN_SECRET.
 */

export const ADMIN_COOKIE = "mad_admin";
const SECRET =
  process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "mad-dev-secret-change-me";

function sign(value: string) {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}

export function makeToken() {
  return `ok.${sign("ok")}`;
}

export function verifyToken(token?: string) {
  if (!token) return false;
  const [value, mac] = token.split(".");
  if (value !== "ok" || !mac) return false;
  const expected = sign("ok");
  try {
    return crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function checkPassword(pw: string) {
  const real = process.env.ADMIN_PASSWORD || "admin";
  return pw === real;
}

export async function isAuthed() {
  const store = await cookies();
  return verifyToken(store.get(ADMIN_COOKIE)?.value);
}
