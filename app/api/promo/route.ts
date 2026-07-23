import { NextResponse } from "next/server";
import { z } from "zod";
import { validatePromo } from "@/lib/data/promos";

const schema = z.object({ code: z.string().min(1).max(40) });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Code invalide." }, { status: 400 });
  }

  const promo = await validatePromo(parsed.data.code);
  if (!promo) {
    return NextResponse.json({ valid: false, error: "Code promo invalide ou expiré." });
  }

  return NextResponse.json({
    valid: true,
    promo: {
      code: promo.code,
      type: promo.type,
      value: promo.value,
      label: promo.label,
    },
  });
}
