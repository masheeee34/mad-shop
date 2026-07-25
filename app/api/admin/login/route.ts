import { NextResponse } from "next/server";
import { z } from "zod";
import {
  checkPassword,
  makeToken,
  isAdminConfigured,
  ADMIN_COOKIE,
  ADMIN_COOKIE_OPTIONS,
} from "@/lib/admin-auth";
import { clientIp, rateLimit, resetRateLimit } from "@/lib/rate-limit";

const schema = z.object({ password: z.string().min(1).max(200) });

/** 5 tentatives par tranche de 10 minutes et par IP. */
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit("admin-login", ip, MAX_ATTEMPTS, WINDOW_MS);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez plus tard." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  if (!isAdminConfigured()) {
    console.error("[admin] ADMIN_PASSWORD non configuré — connexion impossible.");
    return NextResponse.json(
      { error: "Espace administration non configuré." },
      { status: 503 },
    );
  }

  if (!checkPassword(parsed.data.password)) {
    // Message volontairement générique : on ne confirme jamais ce qui a échoué.
    return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
  }

  resetRateLimit("admin-login", ip);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, makeToken(), ADMIN_COOKIE_OPTIONS);
  return res;
}
