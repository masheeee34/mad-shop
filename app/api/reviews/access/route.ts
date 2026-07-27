import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rate-limit";

/**
 * Droit d'écriture d'un avis pour le visiteur courant.
 *
 * Cette information dépend du cookie de session : la calculer dans la page
 * produit la rendrait dynamique et ferait perdre la génération statique de
 * tout le catalogue. Elle est donc récupérée à part, après affichage.
 */
export async function GET(req: Request) {
  const limited = enforceRateLimit(req, "reviews-access", 60, 5 * 60_000);
  if (limited) return limited;

  // Puisqu'il n'y a plus de système de compte, tout le monde est autorisé
  // à publier un avis (il sera marqué comme non vérifié par défaut).
  return NextResponse.json({ state: "allowed", suggestedName: "" });
}
