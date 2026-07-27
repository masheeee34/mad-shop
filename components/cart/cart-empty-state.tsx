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
    <div className="w-full flex flex-col items-center gap-8 py-4 overflow-hidden">
      {/* Hero Panier Vide */}
      {showHeader && (
        <div className="flex flex-col items-center text-center gap-5 w-full px-4">
          {/* Icône Cercle Doré - Design Maquette */}
          <div className="grid size-[100px] place-items-center rounded-full border-[1.5px] border-[#c6a46a]">
            <ShoppingBag className="size-[42px] text-[#c6a46a]" strokeWidth={1.5} />
          </div>

          <div className="flex flex-col items-center gap-2 mt-1">
            <h1 className="font-display text-[26px] font-bold tracking-tight text-white uppercase">
              VOTRE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#aa8623]">PANIER</span> EST VIDE
            </h1>
            <p className="text-gray-400 text-[13px] max-w-[280px] leading-relaxed">
              Il semble que vous n'avez pas encore trouvé le produit parfait.
            </p>
          </div>

          <Link
            href="/boutique"
            className="mt-3 inline-flex items-center justify-center gap-2 font-bold tracking-wide select-none bg-[#c19b54] text-black hover:bg-[#d0aa63] transition-colors h-12 px-8 text-sm rounded-full uppercase"
          >
            Découvrir la boutique <ArrowRight className="size-4" strokeWidth={2.5} />
          </Link>
        </div>
      )}

      {/* Séparateur Titre */}
      <div className="w-full flex items-center gap-3 px-4 mt-2">
        <div className="h-[1px] flex-1 bg-[#444]" />
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white text-center">
          LIVRAISON <span className="text-[#c19b54]">RAPIDE, SÉCURISÉE ET</span> PARTOUT DANS LE MONDE
        </span>
        <div className="h-[1px] flex-1 bg-[#444]" />
      </div>

      {/* Cartes Livraison (Scroll Horizontal sur Mobile pour respecter la maquette) */}
      <div className="w-full flex overflow-x-auto snap-x snap-mandatory gap-3 px-4 pb-4 no-scrollbar">
        {/* Card 1: France */}
        <div className="snap-start shrink-0 w-[140px] relative flex flex-col items-center text-center p-4 rounded-xl bg-[#111] border border-[#333]">
          <FranceMapIcon className="size-10 text-[#c19b54] mb-3" />
          <span className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-bold mb-1">FRANCE</span>
          <span className="font-display font-bold text-[#c19b54] text-[15px] leading-tight">
            24H – 72H<br/>OUVRÉES
          </span>
          <span className="text-[9px] text-gray-500 mt-2 leading-tight">Hors week-ends<br/>et jours fériés</span>
        </div>

        {/* Card 2: Europe */}
        <div className="snap-start shrink-0 w-[140px] relative flex flex-col items-center text-center p-4 rounded-xl bg-[#111] border border-[#333]">
          <EuropeStarsIcon className="size-10 text-[#c19b54] mb-3" />
          <span className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-bold mb-1">EUROPE</span>
          <span className="font-display font-bold text-[#c19b54] text-[15px] leading-tight">
            2 À 5 JOURS<br/>OUVRÉS
          </span>
          <span className="text-[9px] text-gray-500 mt-2 leading-tight">Hors week-ends<br/>et jours fériés</span>
        </div>

        {/* Card 3: Monde Entier */}
        <div className="snap-start shrink-0 w-[140px] relative flex flex-col items-center text-center p-4 rounded-xl bg-[#111] border border-[#333]">
          <Globe className="size-10 text-[#c19b54] mb-3" strokeWidth={1} />
          <span className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-bold mb-1">MONDE ENTIER</span>
          <span className="font-display font-bold text-[#c19b54] text-[15px] leading-tight">
            3 À 10 JOURS<br/>OUVRÉS
          </span>
          <span className="text-[9px] text-gray-500 mt-2 leading-tight">Livraison disponible<br/>partout dans le monde</span>
        </div>

        {/* Card 4: Express Main Propre */}
        <div className="snap-start shrink-0 w-[150px] relative flex flex-col items-center text-center p-4 rounded-xl bg-[#0a0a0a] border border-[#c19b54]">
          <div className="absolute -top-2 -right-2 rounded bg-[#c19b54] px-1.5 py-0.5 text-[8px] font-bold uppercase text-black">
            SERVICE EXPRESS
          </div>
          <ExpressScooterIcon className="size-10 text-[#c19b54] mb-2" />
          <span className="text-[9px] uppercase tracking-[0.1em] text-white font-bold leading-tight mb-1">EXPRESS MAIN PROPRE</span>
          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#c19b54]">ÎLE-DE-FRANCE</span>
          <span className="font-display font-extrabold text-[#c19b54] text-[22px] mt-1">24H</span>
          <span className="text-[8px] text-gray-400 mt-0.5">À partir de 150€ d'achat</span>
          <span className="mt-2 rounded-full bg-[#c19b54] px-4 py-1 text-[9px] font-bold uppercase text-black">
            OFFERTE
          </span>
        </div>
      </div>

      {/* Cartes Réassurance / Garanties (Scroll Horizontal) */}
      <div className="w-full flex overflow-x-auto snap-x snap-mandatory gap-3 px-4 pb-4 no-scrollbar mt-[-10px]">
        {/* Item 1 */}
        <div className="snap-start shrink-0 w-[140px] flex flex-col items-center text-center p-4 rounded-xl bg-[#111] border border-[#333]">
          <ShieldCheck className="size-8 text-[#c19b54] mb-2" strokeWidth={1.5} />
          <span className="font-display font-bold text-[10px] uppercase text-white mb-1 leading-tight">
            SATISFAIT OU<br/>REMBOURSÉ
          </span>
          <span className="text-[9px] text-gray-400">Garantie 100%</span>
          <span className="text-[9px] text-gray-500">Retour gratuit sous 14 jours</span>
        </div>

        {/* Item 2 */}
        <div className="snap-start shrink-0 w-[140px] flex flex-col items-center text-center p-4 rounded-xl bg-[#111] border border-[#333]">
          <Lock className="size-8 text-[#c19b54] mb-2" strokeWidth={1.5} />
          <span className="font-display font-bold text-[10px] uppercase text-white mb-1 leading-tight">
            PAIEMENT<br/>SÉCURISÉ
          </span>
          <span className="text-[9px] text-gray-400">Cryptage SSL / Stripe</span>
          <span className="text-[9px] text-gray-500">Transactions 100% sécurisées</span>
        </div>

        {/* Item 3 */}
        <div className="snap-start shrink-0 w-[140px] flex flex-col items-center text-center p-4 rounded-xl bg-[#111] border border-[#333]">
          <Headphones className="size-8 text-[#c19b54] mb-2" strokeWidth={1.5} />
          <span className="font-display font-bold text-[10px] uppercase text-white mb-1 leading-tight">
            SERVICE<br/>CLIENT
          </span>
          <span className="text-[9px] text-gray-400">Réactif et à l'écoute</span>
          <span className="text-[9px] text-gray-500">Nous répondons sous 24h</span>
        </div>

        {/* Item 4 */}
        <div className="snap-start shrink-0 w-[140px] flex flex-col items-center text-center p-4 rounded-xl bg-[#111] border border-[#333]">
          <Award className="size-8 text-[#c19b54] mb-2" strokeWidth={1.5} />
          <span className="font-display font-bold text-[10px] uppercase text-white mb-1 leading-tight">
            PRODUITS<br/>SÉLECTIONNÉS
          </span>
          <span className="text-[9px] text-gray-400">Qualité testée<br/>et approuvée</span>
        </div>
      </div>
    </div>
  );
}
