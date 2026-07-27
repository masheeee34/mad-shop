"use client";

import Link from "next/link";
import {
  ShoppingBag,
  ArrowRight,
  Globe,
  ShieldCheck,
  Lock,
  Headphones,
  Award,
  Zap,
} from "lucide-react";

/** SVG Carte de la France en filigrane / doré */
function FranceMapIcon({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className={className}>
      <path
        d="M35 15 L50 12 L70 20 L88 35 L80 58 L85 75 L65 90 L45 85 L25 88 L12 65 L18 45 L15 30 Z"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** SVG Étoiles Europe (Drapeau européen) */
function EuropeStarsIcon({ className = "size-8" }: { className?: string }) {
  const stars = [];
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30 * Math.PI) / 180;
    const cx = 50 + 32 * Math.cos(angle);
    const cy = 50 + 32 * Math.sin(angle);
    stars.push(
      <circle key={i} cx={cx} cy={cy} r="3.5" fill="currentColor" />
    );
  }
  return (
    <svg viewBox="0 0 100 100" className={className}>
      {stars}
    </svg>
  );
}

/** SVG Scooter / Express Delivery */
function ExpressScooterIcon({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10l-3-4H9" />
      <circle cx="7" cy="17" r="3" />
      <circle cx="17" cy="17" r="3" />
      <path d="M9 17h5" />
      <path d="M13 6h-4" />
      <path d="M5 9l-3 3h4" />
    </svg>
  );
}

export function CartEmptyState({ showHeader = true }: { showHeader?: boolean }) {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-10 py-6">
      {/* Hero Panier Vide */}
      {showHeader && (
        <div className="flex flex-col items-center text-center gap-4">
          {/* Icône Cercle Doré */}
          <div className="relative grid size-24 place-items-center rounded-full border-2 border-gold/40 bg-charcoal/80 shadow-[0_0_40px_rgba(198,164,106,0.15)]">
            <div className="grid size-16 place-items-center rounded-full border border-gold/20 bg-elevated">
              <ShoppingBag className="size-8 text-gold" />
            </div>
          </div>

          <h1 className="display text-2xl sm:text-4xl font-extrabold tracking-tight text-cream mt-2">
            VOTRE <span className="text-gold-bright">PANIER</span> EST VIDE
          </h1>
          <p className="text-muted text-sm sm:text-base max-w-md">
            Il semble que vous n'avez pas encore trouvé le produit parfait.
          </p>

          <Link
            href="/boutique"
            className="mt-2 inline-flex items-center justify-center gap-2 font-bold tracking-wide transition-all duration-300 select-none bg-gold text-ink hover:bg-gold-bright shadow-[0_10px_30px_-12px_rgba(198,164,106,0.6)] h-12 px-8 text-sm sm:text-base rounded-full uppercase"
          >
            Découvrir la boutique <ArrowRight className="size-4" />
          </Link>
        </div>
      )}

      {/* Séparateur Titre */}
      <div className="w-full flex items-center gap-3 my-2">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gold/40 to-line" />
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-cream/90 text-center px-2">
          LIVRAISON <span className="text-gold-bright">RAPIDE</span>, SÉCURISÉE ET <span className="text-gold-bright">PARTOUT DANS LE MONDE</span>
        </span>
        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-gold/40 to-line" />
      </div>

      {/* Cartes Livraison (4 Colonnes / Grid 2x2) */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: France */}
        <div className="card relative flex flex-col items-center text-center p-5 bg-charcoal/80 border-line hover:border-gold/30 transition-colors">
          <div className="text-gold mb-3">
            <FranceMapIcon className="size-9 text-gold" />
          </div>
          <span className="text-xs uppercase tracking-[0.2em] text-muted font-bold">FRANCE</span>
          <span className="font-display font-bold text-gold-bright text-base sm:text-lg mt-1">
            24H – 72H OUVRÉES
          </span>
          <span className="text-[11px] text-faint mt-1">Hors week-ends et jours fériés</span>
        </div>

        {/* Card 2: Europe */}
        <div className="card relative flex flex-col items-center text-center p-5 bg-charcoal/80 border-line hover:border-gold/30 transition-colors">
          <div className="text-gold mb-3">
            <EuropeStarsIcon className="size-9 text-gold" />
          </div>
          <span className="text-xs uppercase tracking-[0.2em] text-muted font-bold">EUROPE</span>
          <span className="font-display font-bold text-gold-bright text-base sm:text-lg mt-1">
            2 À 5 JOURS OUVRÉS
          </span>
          <span className="text-[11px] text-faint mt-1">Hors week-ends et jours fériés</span>
        </div>

        {/* Card 3: Monde Entier */}
        <div className="card relative flex flex-col items-center text-center p-5 bg-charcoal/80 border-line hover:border-gold/30 transition-colors">
          <div className="text-gold mb-3">
            <Globe className="size-9 text-gold" />
          </div>
          <span className="text-xs uppercase tracking-[0.2em] text-muted font-bold">MONDE ENTIER</span>
          <span className="font-display font-bold text-gold-bright text-base sm:text-lg mt-1">
            3 À 10 JOURS OUVRÉS
          </span>
          <span className="text-[11px] text-faint mt-1">Livraison disponible partout dans le monde</span>
        </div>

        {/* Card 4: Express Main Propre (Mise en avant Dorée) */}
        <div className="card relative flex flex-col items-center text-center p-5 bg-charcoal/90 border-2 border-gold/60 shadow-[0_0_25px_rgba(198,164,106,0.15)]">
          <span className="absolute top-2 right-2 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold-bright">
            SERVICE EXPRESS
          </span>

          <div className="text-gold mb-2 mt-1">
            <ExpressScooterIcon className="size-9 text-gold-bright" />
          </div>
          <span className="text-xs uppercase tracking-[0.18em] text-cream font-bold">EXPRESS MAIN PROPRE</span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-gold mt-0.5">ÎLE-DE-FRANCE</span>
          <span className="font-display font-extrabold text-gold-bright text-2xl mt-1">
            24H
          </span>
          <span className="text-[11px] text-muted mt-0.5">À partir de 150€ d'achat</span>
          <span className="mt-3 rounded-full bg-gold px-4 py-1 text-xs font-bold uppercase tracking-wider text-ink">
            OFFERTE
          </span>
        </div>
      </div>

      {/* Cartes Réassurance / Garanties (4 Colonnes) */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
        {/* Item 1 */}
        <div className="card flex flex-col items-center text-center p-5 bg-charcoal/50 border-line">
          <div className="grid size-10 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold mb-3">
            <ShieldCheck className="size-5" />
          </div>
          <span className="font-display font-bold text-xs uppercase tracking-wider text-cream">
            SATISFAIT OU REMBOURSÉ
          </span>
          <span className="text-[11px] text-muted mt-1">Garantie 100%</span>
          <span className="text-[11px] text-faint">Retour gratuit sous 14 jours</span>
        </div>

        {/* Item 2 */}
        <div className="card flex flex-col items-center text-center p-5 bg-charcoal/50 border-line">
          <div className="grid size-10 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold mb-3">
            <Lock className="size-5" />
          </div>
          <span className="font-display font-bold text-xs uppercase tracking-wider text-cream">
            PAIEMENT SÉCURISÉ
          </span>
          <span className="text-[11px] text-muted mt-1">Cryptage SSL / Stripe</span>
          <span className="text-[11px] text-faint">Transactions 100% sécurisées</span>
        </div>

        {/* Item 3 */}
        <div className="card flex flex-col items-center text-center p-5 bg-charcoal/50 border-line">
          <div className="grid size-10 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold mb-3">
            <Headphones className="size-5" />
          </div>
          <span className="font-display font-bold text-xs uppercase tracking-wider text-cream">
            SERVICE CLIENT
          </span>
          <span className="text-[11px] text-muted mt-1">Réactif et à l'écoute</span>
          <span className="text-[11px] text-faint">Nous répondons sous 24h</span>
        </div>

        {/* Item 4 */}
        <div className="card flex flex-col items-center text-center p-5 bg-charcoal/50 border-line">
          <div className="grid size-10 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold mb-3">
            <Award className="size-5" />
          </div>
          <span className="font-display font-bold text-xs uppercase tracking-wider text-cream">
            PRODUITS SÉLECTIONNÉS
          </span>
          <span className="text-[11px] text-muted mt-1">Qualité testée et approuvée</span>
        </div>
      </div>
    </div>
  );
}
