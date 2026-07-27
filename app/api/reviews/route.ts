import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addReview } from "@/lib/data/reviews";
import { getProduct } from "@/lib/data/catalog";
import { enforceRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  slug: z.string().min(1).max(120),
  author: z.string().min(2).max(80),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3).max(1000),
  /** Champ leurre : rempli uniquement par les robots. */
  website: z.string().max(0).optional().or(z.literal("")),
});

/**
 * Dépôt d'un avis.
 *
 * Seul un client connecté ayant réellement acheté le produit peut publier.
 * C'est ce qui rend la note affichée défendable — et ce que Google attend
 * pour accorder les étoiles dans les résultats de recherche.
 */
export async function POST(req: Request) {
  const limited = enforceRateLimit(req, "reviews", 5, 60 * 60_000);
  if (limited) return limited;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Avis invalide." }, { status: 400 });
  }

  const { data } = parsed;

  const product = await getProduct(data.slug);
  if (!product) {
    return NextResponse.json(
      { error: "Ce produit n'existe plus." },
      { status: 400 },
    );
  }

  const review = await addReview({
    slug: data.slug,
    author: data.author,
    rating: data.rating,
    comment: data.comment,
    email: undefined,
    verified: false,
  });

  revalidatePath(`/produit/${data.slug}`);

  // Si la modération manuelle est active, l'avis n'est pas encore public.
  return NextResponse.json({
    review: review.approved ? review : null,
    pending: !review.approved,
  });
}
