import Anthropic from "@anthropic-ai/sdk";
import { getProducts } from "@/lib/data/catalog";
import { formatPrice } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 30;

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

async function buildSystemPrompt() {
  const products = await getProducts();
  const catalogue = products
    .map(
      (p) =>
        `- ${p.name} (${p.category}) — ${formatPrice(p.priceCents)} : ${p.shortDescription} Points forts : ${p.highlights.join(", ")}.`,
    )
    .join("\n");

  return `Tu es l'assistant virtuel de MAD Shop, une boutique en ligne française vendant de l'audio, de la sécurité et des objets connectés. Slogan : « La qualité à petit prix ».

Ton rôle : répondre aux clients de façon chaleureuse, concise et professionnelle, en français, sur les produits, la livraison, les paiements et les commandes. Tutoie ou vouvoie selon le client (par défaut, vouvoie poliment). N'invente jamais de caractéristique : si tu ne sais pas, invite à contacter le service client via la page Contact.

Infos boutique :
- Livraison en France et en Europe, 24 à 48h. Livraison offerte dès 60 € d'achat, sinon 4,90 €.
- Paiement 100% sécurisé via Stripe (CB, Apple Pay, Google Pay).
- Satisfait ou remboursé sous 14 jours.
- Tous les produits sont sélectionnés, testés et approuvés.

Catalogue actuel :
${catalogue}

Reste bref (2-4 phrases), propose le produit pertinent avec son prix quand c'est utile, et termine par une question ouverte si adapté. N'utilise pas de markdown lourd.`;
}

export async function POST(req: Request) {
  const { messages } = await req.json().catch(() => ({ messages: [] }));

  const clean = (Array.isArray(messages) ? messages : [])
    .filter((m) => m?.role === "user" || m?.role === "assistant")
    .slice(-10)
    .map((m) => ({ role: m.role as "user" | "assistant", content: String(m.content) }));

  // Mode démo sans clé : réponse utile non-IA.
  if (!anthropic) {
    const fallback =
      "L'assistant IA n'est pas encore activé, mais je peux déjà vous aider : livraison en 24-48h partout en France et en Europe (offerte dès 60 €), paiement sécurisé et satisfait ou remboursé sous 14 jours. Pour une question précise, écrivez-nous via la page Contact !";
    return new Response(fallback, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const system = await buildSystemPrompt();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        const anthropicStream = anthropic.messages.stream({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 400,
          system,
          messages: clean.length ? clean : [{ role: "user", content: "Bonjour" }],
        });
        anthropicStream.on("text", (text) => controller.enqueue(encoder.encode(text)));
        await anthropicStream.finalMessage();
      } catch (err) {
        console.error("[chat]", err);
        controller.enqueue(
          encoder.encode(
            "Désolé, je rencontre un souci technique. Réessayez ou contactez-nous via la page Contact.",
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
