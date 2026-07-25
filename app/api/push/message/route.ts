import { NextResponse } from "next/server";
import { getPushMessage } from "@/lib/data/push";
import { enforceRateLimit } from "@/lib/rate-limit";

/**
 * Texte à afficher pour un abonnement donné.
 *
 * Appelé par le service worker au réveil, le push partant sans contenu. Le
 * paramètre `id` est l'empreinte de l'endpoint : une valeur que seuls le
 * navigateur concerné et nous connaissons, et qui ne se devine pas.
 */
export async function GET(req: Request) {
  const limited = enforceRateLimit(req, "push-message", 60, 10 * 60_000);
  if (limited) return limited;

  const id = new URL(req.url).searchParams.get("id");
  if (!id || !/^[0-9a-f]{32}$/.test(id)) {
    return NextResponse.json({ found: false }, { status: 400 });
  }

  const message = await getPushMessage(id);
  if (!message) return NextResponse.json({ found: false });

  return NextResponse.json(
    {
      found: true,
      title: message.title,
      body: message.body,
      url: message.url,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
