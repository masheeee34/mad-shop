import { NextResponse } from "next/server";
import { z } from "zod";
import { addNotification } from "@/lib/data/notifications";
import { getProduct } from "@/lib/data/catalog";
import { resend, FROM_EMAIL, SHOP_EMAIL, emailShell } from "@/lib/email";

const schema = z.object({
  productSlug: z.string(),
  email: z.string().email("Adresse email invalide."),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Champs invalides." },
        { status: 400 }
      );
    }

    const product = await getProduct(parsed.data.productSlug);
    const productName = product ? product.name : parsed.data.productSlug;

    // Enregistrer la demande d'alerte
    await addNotification(parsed.data.productSlug, productName, parsed.data.email);

    // Alerte email au gestionnaire de boutique si Resend est configuré
    if (resend) {
      await resend.emails
        .send({
          from: FROM_EMAIL,
          to: SHOP_EMAIL,
          subject: `🔥 HYPE ALERT : Demande d'alerte stock pour "${productName}"`,
          html: emailShell(
            "Demande d'alerte réapprovisionnement",
            `<p style="color:#a29c92">Un client souhaite être prévenu dès le retour en stock :</p>
             <p style="color:#f4f1ea"><strong>Produit :</strong> <span style="color:#c6a46a">${productName}</span></p>
             <p style="color:#f4f1ea"><strong>Email client :</strong> ${parsed.data.email}</p>`
          ),
        })
        .catch((e) => console.error("[notify-stock mail]", e));
    }

    return NextResponse.json({
      success: true,
      message: "Votre demande d'alerte a été enregistrée avec succès !",
    });
  } catch (err) {
    console.error("[notify-stock]", err);
    return NextResponse.json(
      { error: "Une erreur est survenue." },
      { status: 500 }
    );
  }
}
