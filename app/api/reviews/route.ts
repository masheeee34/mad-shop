import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addReview } from "@/lib/data/reviews";
import { getProduct } from "@/lib/data/catalog";

const schema = z.object({
  slug: z.string().min(1),
  author: z.string().min(2).max(80),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3).max(1000),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Avis invalide." }, { status: 400 });
  }

  // On vérifie que le produit existe.
  const product = await getProduct(parsed.data.slug);
  if (!product) {
    return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
  }

  const review = await addReview(parsed.data);
  revalidatePath(`/produit/${parsed.data.slug}`);
  return NextResponse.json({ review });
}
