import { NextResponse } from "next/server";
import { z } from "zod";
import { findOrder, STATUS_LABELS } from "@/lib/data/orders";

const schema = z.object({
  number: z.string().min(3).max(40),
  email: z.string().email(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Informations invalides." }, { status: 400 });
  }

  const order = await findOrder(parsed.data.number, parsed.data.email);
  if (!order) {
    return NextResponse.json({
      found: false,
      error: "Aucune commande trouvée pour ce numéro et cet email.",
    });
  }

  return NextResponse.json({
    found: true,
    order: {
      number: order.number,
      status: order.status,
      statusLabel: STATUS_LABELS[order.status],
      totalCents: order.totalCents,
      items: order.items,
      createdAt: order.createdAt,
    },
  });
}
