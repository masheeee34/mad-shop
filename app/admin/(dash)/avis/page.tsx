import { allReviews } from "@/lib/data/reviews";
import { RatingStars } from "@/components/product/rating-stars";
import { approveReviewAction, deleteReviewAction, replyReviewAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await allReviews();

  return (
    <div>
      <h1 className="display text-3xl md:text-4xl">Avis</h1>
      <p className="mt-2 text-muted">
        {reviews.length} avis · modérez ce qui est publié sur les fiches produits.
      </p>

      {reviews.length === 0 ? (
        <p className="mt-10 text-muted">Aucun avis pour l'instant.</p>
      ) : (
        <div className="mt-8 space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{r.author}</span>
                    <RatingStars value={r.rating} />
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        r.approved ? "bg-it-green/15 text-it-green" : "bg-elevated text-faint"
                      }`}
                    >
                      {r.approved ? "Publié" : "Masqué"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted">{r.comment}</p>
                  <p className="mt-1 text-xs text-faint">
                    Produit : {r.slug} · {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <form action={approveReviewAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="approved" value={(!r.approved).toString()} />
                    <Button type="submit" size="sm" variant="outline">
                      {r.approved ? "Masquer" : "Publier"}
                    </Button>
                  </form>
                  <form action={deleteReviewAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <Button type="submit" size="sm" variant="ghost" className="text-it-red">
                      Supprimer
                    </Button>
                  </form>
                </div>
              </div>
              
              <div className="mt-4 border-t border-line pt-4">
                <form action={replyReviewAction} className="flex gap-2">
                  <input type="hidden" name="id" value={r.id} />
                  <input 
                    type="text" 
                    name="reply" 
                    defaultValue={r.adminReply || ""}
                    placeholder="Répondre à cet avis..." 
                    className="flex-1 rounded-md border border-line bg-transparent px-3 py-1.5 text-sm outline-none focus:border-gold"
                  />
                  <Button type="submit" size="sm" variant="outline">
                    {r.adminReply ? "Modifier" : "Répondre"}
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
