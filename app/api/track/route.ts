import { NextResponse } from "next/server";
import { z } from "zod";
import { findOrder, STATUS_LABELS } from "@/lib/data/orders";
import { enforceRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  number: z.string().min(3).max(40),
  email: z.string().email(),
});

/** Réponse jamais mise en cache : elle contient des données personnelles. */
const NO_STORE = { "Cache-Control": "no-store" };

export async function POST(req: Request) {
  // Le couple numéro + email est devinable par force brute : on plafonne.
  const limited = enforceRateLimit(req, "track", 10, 10 * 60_000);
  if (limited) return limited;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Informations invalides." },
      { status: 400, headers: NO_STORE },
    );
  }

  const order = await findOrder(parsed.data.number, parsed.data.email);
  if (!order) {
    return NextResponse.json(
      { found: false, error: "Aucune commande trouvée pour ce numéro et cet email." },
      { headers: NO_STORE },
    );
  }

  return NextResponse.json(
    {
      found: true,
      order: {
        number: order.number,
        status: order.status,
        statusLabel: STATUS_LABELS[order.status],
        totalCents: order.totalCents,
        items: order.items,
        createdAt: order.createdAt,
      },
    },
    { headers: NO_STORE },
  );
}
