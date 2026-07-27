"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

/**
 * Activation des notifications push.
 *
 * Le navigateur ne redemande jamais la permission une fois refusée : on ne
 * la sollicite donc qu'après un geste explicite, jamais au chargement. Un
 * bandeau « autorisez les notifications » affiché d'office brûle l'unique
 * occasion de la demander.
 */
type State =
  | "checking"
  | "unsupported"
  | "idle"
  | "loading"
  | "subscribed"
  | "denied"
  | "error";

/**
 * La clé publique VAPID voyage en base64url ; l'API attend des octets.
 *
 * Le tableau est adossé à un `ArrayBuffer` explicite : depuis TypeScript 5.7,
 * `Uint8Array` est générique sur son type de tampon, et `applicationServerKey`
 * refuse un tampon susceptible d'être partagé (`SharedArrayBuffer`).
 */
function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(normalized);
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

export function PushOptIn({
  orderNumber,
  orderEmail,
  label = "Être prévenu du départ de mon colis",
}: {
  /** Rattache l'appareil à une commande pour un acheteur non connecté. */
  orderNumber?: string;
  orderEmail?: string;
  label?: string;
}) {
  const [state, setState] = useState<State>("checking");

  useEffect(() => {
    if (!VAPID_PUBLIC_KEY) {
      setState("unsupported");
      return;
    }
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }

    let cancelled = false;
    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => {
        if (!cancelled) setState(subscription ? "subscribed" : "idle");
      })
      .catch(() => {
        if (!cancelled) setState("idle");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function enable() {
    setState("loading");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "idle");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          // Obligatoire : chaque push doit se traduire par une notification
          // visible. Chrome refuse l'abonnement sans cette option.
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        }));

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          orderNumber,
          orderEmail,
        }),
      });

      setState(res.ok ? "subscribed" : "error");
    } catch {
      setState("error");
    }
  }

  async function disable() {
    setState("loading");
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        }).catch(() => {
          /* le désabonnement local prime */
        });
        await subscription.unsubscribe();
      }
      setState("idle");
    } catch {
      setState("error");
    }
  }

  // Rien à proposer : ni bandeau, ni message d'erreur inutile.
  if (state === "checking" || state === "unsupported") return null;

  if (state === "denied") {
    return (
      <p className="flex items-center gap-2 text-sm text-faint">
        <BellOff className="size-4 shrink-0" />
        Les notifications sont bloquées pour ce site dans les réglages de votre
        navigateur.
      </p>
    );
  }

  if (state === "subscribed") {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <p className="flex items-center gap-2 text-sm text-it-green">
          <BellRing className="size-4 shrink-0" />
          Notifications activées sur cet appareil.
        </p>
        <button
          onClick={disable}
          className="link-underline text-xs text-faint transition hover:text-muted"
        >
          Désactiver
        </button>
      </div>
    );
  }

  return (
    <div>
      <Button
        variant="outline"
        size="md"
        onClick={enable}
        disabled={state === "loading"}
      >
        {state === "loading" ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Activation…
          </>
        ) : (
          <>
            <Bell className="size-4" /> {label}
          </>
        )}
      </Button>
      {state === "error" && (
        <p role="alert" className="mt-2 text-sm text-it-red">
          Activation impossible. Réessayez dans un instant.
        </p>
      )}
    </div>
  );
}
