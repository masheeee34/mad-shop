import Link from "next/link";
import { Lock, Truck, ShieldCheck, Headphones } from "lucide-react";
import { Logo } from "@/components/brand/logo";

const trust = [
  { icon: Truck, title: "Livraison 24-48h", sub: "France & Europe" },
  { icon: ShieldCheck, title: "Satisfait ou remboursé", sub: "Garantie 100%" },
  { icon: Lock, title: "Paiement sécurisé", sub: "Cryptage SSL / Stripe" },
  { icon: Headphones, title: "Service client", sub: "Réactif et à l'écoute" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-charcoal">
      {/* Bandeau réassurance */}
      <div className="border-b border-line">
        <div className="shell grid grid-cols-2 gap-6 py-10 lg:grid-cols-4">
          {trust.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-full border border-line text-gold">
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-cream">{title}</span>
                <span className="block text-xs text-muted">{sub}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="shell grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo variant="full" className="h-16" />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted">
            Des produits fiables, testés et approuvés. La qualité à petit prix,
            livrée partout en France et en Europe.
          </p>
          <div className="mt-6 flex gap-3">
            <SocialLink href="https://instagram.com" label="Instagram">
              <InstagramIcon />
            </SocialLink>
            <SocialLink href="https://facebook.com" label="Facebook">
              <FacebookIcon />
            </SocialLink>
            <SocialLink href="https://tiktok.com" label="TikTok">
              <TikTokIcon />
            </SocialLink>
          </div>
        </div>

        <FooterCol
          title="Boutique"
          links={[
            { href: "/boutique", label: "Tous les produits" },
            { href: "/boutique?cat=Audio", label: "Audio" },
            { href: "/boutique?cat=Sécurité", label: "Sécurité" },
            { href: "/boutique?cat=Connecté", label: "Connecté" },
          ]}
        />
        <FooterCol
          title="Aide"
          links={[
            { href: "/a-propos", label: "À propos" },
            { href: "/contact", label: "Contact" },
            { href: "/suivi", label: "Suivi de commande" },
            { href: "/livraison", label: "Livraison & retours" },
            { href: "/mentions-legales", label: "Mentions légales" },
          ]}
        />
      </div>

      <span className="tricolore block" aria-hidden />
      <div className="shell flex flex-col items-center justify-between gap-3 py-6 text-xs text-faint md:flex-row">
        <p>© {new Date().getFullYear()} MAD Shop — Tous droits réservés.</p>
        <p>Fait avec soin, en France 🇫🇷 & 🇮🇹</p>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link
              href={l.href}
              className="text-sm text-muted transition hover:text-cream link-underline"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="grid size-10 place-items-center rounded-full border border-line text-cream transition hover:border-gold/60 hover:text-gold-bright"
    >
      {children}
    </a>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
      <path d="M16.6 5.82a4.28 4.28 0 0 1-1.05-2.82h-3.3v12.2a2.36 2.36 0 0 1-2.36 2.3 2.36 2.36 0 0 1-2.36-2.36 2.36 2.36 0 0 1 2.98-2.28V9.5a5.66 5.66 0 0 0-5.94 5.66 5.66 5.66 0 0 0 11.32 0V8.9a7.5 7.5 0 0 0 4.3 1.35V6.94a4.28 4.28 0 0 1-3.59-1.12z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
      <path d="M14 8.5V6.9c0-.8.2-1.3 1.4-1.3H17V2.7c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v1.8H8v3h2.6V22H14v-8.5h2.6l.4-3H14z" />
    </svg>
  );
}
