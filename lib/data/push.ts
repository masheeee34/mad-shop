import "server-only";
import { readJSON, writeJSON } from "./store";

const FILE = "push_subscriptions.json";

/**
 * Abonnements aux notifications push.
 *
 * L'adresse email sert de jointure avec les commandes et les alertes de
 * stock : c'est la seule clé déjà connue partout dans la boutique, et elle
 * évite d'inventer un identifiant client supplémentaire.
 *
 * Le message en attente est stocké ici plutôt qu'envoyé dans la notification :
 * le push part sans contenu (voir lib/push.ts), et c'est le service worker
 * qui vient chercher le texte à afficher.
 */
export type PushMessage = {
  title: string;
  body: string;
  /** Page ouverte au clic sur la notification. */
  url: string;
  at: string;
};

export type PushRecord = {
  /** Empreinte de l'endpoint : jamais l'endpoint lui-même côté client. */
  id: string;
  endpoint: string;
  email?: string;
  createdAt: string;
  message?: PushMessage;
};

async function all(): Promise<PushRecord[]> {
  return readJSON<PushRecord[]>(FILE, []);
}

export async function getPushSubscriptions(): Promise<PushRecord[]> {
  return all();
}

/** Crée l'abonnement, ou rafraîchit l'email d'un abonnement déjà connu. */
export async function savePushSubscription(input: {
  id: string;
  endpoint: string;
  email?: string;
}): Promise<void> {
  const records = await all();
  const existing = records.find((r) => r.id === input.id);

  if (existing) {
    existing.endpoint = input.endpoint;
    if (input.email) existing.email = input.email;
  } else {
    records.push({
      id: input.id,
      endpoint: input.endpoint,
      email: input.email,
      createdAt: new Date().toISOString(),
    });
  }

  await writeJSON(FILE, records);
}

export async function removePushSubscription(id: string): Promise<void> {
  const records = await all();
  const next = records.filter((r) => r.id !== id);
  if (next.length !== records.length) await writeJSON(FILE, next);
}

/** Supprime en une passe les abonnements révoqués par le navigateur. */
export async function removePushSubscriptions(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const gone = new Set(ids);
  const records = await all();
  const next = records.filter((r) => !gone.has(r.id));
  if (next.length !== records.length) await writeJSON(FILE, next);
}

export async function subscriptionsForEmail(email: string): Promise<PushRecord[]> {
  const wanted = email.trim().toLowerCase();
  return (await all()).filter((r) => r.email?.toLowerCase() === wanted);
}

/** Dépose le texte que le service worker viendra lire au réveil. */
export async function queuePushMessage(
  ids: string[],
  message: Omit<PushMessage, "at">,
): Promise<void> {
  if (ids.length === 0) return;
  const targets = new Set(ids);
  const records = await all();
  const at = new Date().toISOString();
  let changed = false;

  for (const record of records) {
    if (targets.has(record.id)) {
      record.message = { ...message, at };
      changed = true;
    }
  }

  if (changed) await writeJSON(FILE, records);
}

/** Durée au-delà de laquelle un message en attente n'est plus affiché. */
const MESSAGE_TTL_MS = 24 * 60 * 60 * 1000;

export async function getPushMessage(id: string): Promise<PushMessage | null> {
  const record = (await all()).find((r) => r.id === id);
  if (!record?.message) return null;

  const age = Date.now() - new Date(record.message.at).getTime();
  return age <= MESSAGE_TTL_MS ? record.message : null;
}
