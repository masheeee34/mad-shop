import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="shell grid min-h-[70vh] place-items-center pt-32 text-center">
      <div className="flex flex-col items-center">
        <p className="font-display text-8xl font-bold text-gold-gradient">404</p>
        <span className="tricolore my-6 block w-32" aria-hidden />
        <h1 className="display text-3xl md:text-4xl">Page introuvable</h1>
        <p className="mt-3 max-w-md text-muted">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <div className="mt-8 flex gap-4">
          <ButtonLink href="/" size="lg">Accueil</ButtonLink>
          <ButtonLink href="/boutique" variant="outline" size="lg">Boutique</ButtonLink>
        </div>
      </div>
    </div>
  );
}
