import { NextResponse } from "next/server";
import { CUSTOMER_COOKIE, CUSTOMER_COOKIE_OPTIONS } from "@/lib/customer-auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CUSTOMER_COOKIE, "", { ...CUSTOMER_COOKIE_OPTIONS, maxAge: 0 });
  return res;
}
