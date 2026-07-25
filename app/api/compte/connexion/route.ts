import { NextResponse } from "next/server";
import {
  readLoginToken,
  makeSessionToken,
  CUSTOMER_COOKIE,
  CUSTOMER_COOKIE_OPTIONS,
} from "@/lib/customer-auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/config";

/**
 * Ouverture de session depuis le lien reçu par email.
 * Le jeton n'est jamais conservé : il est vérifié, échangé contre un cookie
 * de session, puis retiré de l'URL par la redirection — pour ne pas rester
 * dans l'historique du navigateur ni dans l'en-tête `Referer`.
 */
export async function GET(req: Request) {
  const limited = enforceRateLimit(req, "compte-connexion", 20, 15 * 60_000);
  if (limited) return limited;

  const token = new URL(req.url).searchParams.get("token");
  const email = token ? readLoginToken(token) : null;

  if (!email) {
    return NextResponse.redirect(`${SITE_URL}/compte/connexion?erreur=lien`, 303);
  }

  const res = NextResponse.redirect(`${SITE_URL}/compte`, 303);
  res.cookies.set(CUSTOMER_COOKIE, makeSessionToken(email), CUSTOMER_COOKIE_OPTIONS);
  return res;
}
