/**
 * Page offline — affichée par le Service Worker quand
 * l'utilisateur est hors connexion et que la page n'est pas en cache.
 */
import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export const metadata = {
  title: "Hors ligne · MAD Shop",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
      <Logo variant="full" className="h-16" />
      <div className="grid size-20 place-items-center rounded-full border border-line bg-elevated">
        <WifiOff className="size-8 text-muted" />
      </div>
      <div>
        <h1 className="display text-3xl">Vous êtes hors ligne</h1>
        <p className="mt-3 text-muted">
          Vérifiez votre connexion internet et réessayez.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-full bg-cream px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-ink transition hover:bg-gold-bright"
      >
        Réessayer
      </Link>
      <span className="tricolore block w-32" aria-hidden />
    </div>
  );
}
