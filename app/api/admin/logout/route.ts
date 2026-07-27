import { NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_COOKIE_OPTIONS } from "@/lib/admin-auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // Mêmes attributs qu'à la pose du cookie, sinon certains navigateurs
  // refusent de le supprimer.
  res.cookies.set(ADMIN_COOKIE, "", { ...ADMIN_COOKIE_OPTIONS, maxAge: 0 });
  return res;
}
