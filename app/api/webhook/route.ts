import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { resend, FROM_EMAIL, SHOP_EMAIL, emailShell } from "@/lib/email";
import { createOrder, type OrderItem } from "@/lib/data/orders";
import { formatPrice } from "@/lib/utils";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ received: true, skipped: true });
  }

  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, secret);
  } catch (err) {
    console.error("[webhook] signature invalide", err);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email ?? "";
    const name = session.customer_details?.name ?? "";
    const total = formatPrice(session.amount_total ?? 0);

    // Récupère le détail des articles pour la commande.
    let items: OrderItem[] = [];
    try {
      const lineItems = await stripe!.checkout.sessions.listLineItems(session.id, {
        limit: 50,
      });
      items = lineItems.data.map((li) => ({
        name: li.description ?? "Article",
        quantity: li.quantity ?? 1,
      }));
    } catch (e) {
      console.error("[webhook] line items", e);
    }

    // Enregistre la commande (génère un numéro de suivi).
    const order = await createOrder({
      email,
      name,
      totalCents: session.amount_total ?? 0,
      items,
      sessionId: session.id,
    });

    if (resend && email) {
      const itemsHtml = items
        .map((i) => `<li style="color:#a29c92">${i.quantity} × ${i.name}</li>`)
        .join("");

      // Confirmation au client (avec numéro de suivi)
      await resend.emails
        .send({
          from: FROM_EMAIL,
          to: email,
          subject: `Commande ${order.number} confirmée 🎉`,
          html: emailShell(
            "Merci pour votre commande !",
            `<p style="color:#a29c92;line-height:1.6">Bonjour ${name},</p>
             <p style="color:#a29c92;line-height:1.6">Votre commande <strong style="color:#c6a46a">${order.number}</strong>
             d'un montant de <strong style="color:#c6a46a">${total}</strong> est en préparation et sera expédiée sous 24-48h.</p>
             <ul style="padding-left:18px">${itemsHtml}</ul>
             <p style="color:#a29c92;line-height:1.6">Suivez votre commande à tout moment avec ce numéro sur la page Suivi. Merci de votre confiance ❤️</p>`,
          ),
        })
        .catch((e) => console.error("[webhook] mail client", e));

      // Notification interne
      await resend.emails
        .send({
          from: FROM_EMAIL,
          to: SHOP_EMAIL,
          subject: `🛒 Commande ${order.number} — ${total}`,
          html: emailShell(
            "Nouvelle commande",
            `<p style="color:#a29c92">N° : <strong style="color:#c6a46a">${order.number}</strong></p>
             <p style="color:#a29c92">Client : ${name} (${email})</p>
             <p style="color:#a29c92">Montant : <strong style="color:#c6a46a">${total}</strong></p>
             <ul style="padding-left:18px">${itemsHtml}</ul>`,
          ),
        })
        .catch((e) => console.error("[webhook] mail interne", e));
    }
  }

  return NextResponse.json({ received: true });
}
