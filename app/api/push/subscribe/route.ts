import { NextResponse } from "next/server";
import { z } from "zod";
import {
  savePushSubscription,
  removePushSubscription,
} from "@/lib/data/push";
import { pushSubscriptionId, isPushConfigured } from "@/lib/push";
import { findOrder } from "@/lib/data/orders";
import { enforceRateLimit } from "@/lib/rate-limit";

/**
 * Enregistre un appareil pour les notifications push.
 *
 * L'adresse rattachée n'est jamais celle que le visiteur déclare : elle vient
 * soit de sa session client, soit d'un couple numéro de commande + email qu'il
 * vient de prouver. Sans cela, n'importe qui pourrait s'abonner aux
 * notifications d'un tiers en saisissant son adresse.
 */
const schema = z.object({
  endpoint: z.string().url().max(600),
  /** Rattachement via une commande, pour les acheteurs non connectés. */
  orderNumber: z.string().max(40).optional(),
  orderEmail: z.string().email().optional(),
});

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, "push-subscribe", 20, 10 * 60_000);
  if (limited) return limited;

  if (!isPushConfigured()) {
    return NextResponse.json(
      { error: "Notifications indisponibles." },
      { status: 503 },
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Abonnement invalide." }, { status: 400 });
  }

  const { endpoint, orderNumber, orderEmail } = parsed.data;

  // Seuls les serveurs de push des navigateurs sont acceptés : l'endpoint est
  // relayé tel quel dans une requête sortante, il ne doit pas pouvoir viser
  // une adresse interne.
  if (!isAllowedEndpoint(endpoint)) {
    return NextResponse.json({ error: "Endpoint non supporté." }, { status: 400 });
  }

  let email: string | undefined = undefined;

  if (orderNumber && orderEmail) {
    const order = await findOrder(orderNumber, orderEmail);
    if (order) email = order.email;
  }

  await savePushSubscription({
    id: pushSubscriptionId(endpoint),
    endpoint,
    email,
  });

  return NextResponse.json({ ok: true, linked: Boolean(email) });
}

export async function DELETE(req: Request) {
  const limited = enforceRateLimit(req, "push-subscribe", 20, 10 * 60_000);
  if (limited) return limited;

  const parsed = schema
    .pick({ endpoint: true })
    .safeParse(await req.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Abonnement invalide." }, { status: 400 });
  }

  await removePushSubscription(pushSubscriptionId(parsed.data.endpoint));
  return NextResponse.json({ ok: true });
}

/** Serveurs de push des navigateurs répandus. */
const ALLOWED_HOSTS = [
  /\.googleapis\.com$/, // Chrome / Edge (FCM)
  /\.mozilla\.com$/, // Firefox
  /\.windows\.com$/, // Edge (WNS)
  /\.push\.apple\.com$/, // Safari / iOS
];

function isAllowedEndpoint(endpoint: string): boolean {
  try {
    const url = new URL(endpoint);
    if (url.protocol !== "https:") return false;
    return ALLOWED_HOSTS.some((pattern) => pattern.test(url.hostname));
  } catch {
    return false;
  }
}
