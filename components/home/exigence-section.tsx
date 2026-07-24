"use client";

import { Search, ClipboardCheck, ShieldCheck, Award, ThumbsUp } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

export function ExigenceSection() {
  return (
    <section className="shell py-12 md:py-24">
      <div className="mx-auto max-w-5xl">
        {/* ============ HAUT DE SECTION : TEXTE + VISUEL MÉDAILLE 3D ============ */}
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          {/* Côté Gauche : Titre, Paragraphe & Pilule d'engagement */}
          <Reveal>
            <div>
              <h2 className="display text-3xl leading-[0.95] sm:text-4xl md:text-5xl lg:text-6xl">
                RIEN N'ENTRE AU CATALOGUE SANS ÊTRE{" "}
                <span className="text-gold-gradient block mt-1">APPROUVÉ.</span>
              </h2>

              <p className="mt-5 max-w-md text-base leading-relaxed text-muted md:text-lg">
                Chaque référence passe par trois étapes, dans cet ordre.{" "}
                <span className="text-gold font-medium">Sans raccourci —</span>{" "}
                c'est ce qui fait la différence.
              </p>

              <div className="mt-7">
                <div className="inline-flex items-center gap-2.5 rounded-full border border-gold/30 bg-charcoal/90 px-4 py-2.5 text-xs font-bold tracking-widest text-cream shadow-lg backdrop-blur-sm">
                  <div className="grid size-6 place-items-center rounded-full bg-gold/20">
                    <ShieldCheck className="size-3.5 text-gold" />
                  </div>
                  <span className="uppercase text-[0.72rem] tracking-[0.18em]">
                    NOTRE ENGAGEMENT, VOTRE CONFIANCE.
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Côté Droit : Sceau 3D Doré Pure Vector/SVG & Glow */}
          <Reveal delay={0.15}>
            <div className="relative flex items-center justify-center py-6">
              {/* Effet halo de lumière dorée */}
              <div className="pointer-events-none absolute h-64 w-64 rounded-full bg-gold/15 blur-[90px]" />
              
              {/* Piédestal et Médaille 3D SVG pure */}
              <div className="relative flex flex-col items-center">
                <svg
                  viewBox="0 0 320 320"
                  className="w-64 h-64 sm:w-72 sm:h-72 drop-shadow-[0_20px_40px_rgba(198,164,106,0.25)]"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    {/* Dégradé or pour la bordure externe */}
                    <linearGradient id="goldOuter" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f7e6c4" />
                      <stop offset="35%" stopColor="#c6a46a" />
                      <stop offset="70%" stopColor="#8a6f3a" />
                      <stop offset="100%" stopColor="#e2c286" />
                    </linearGradient>
                    
                    {/* Dégradé fond de médaille */}
                    <radialGradient id="goldInner" cx="40%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#2c261e" />
                      <stop offset="60%" stopColor="#171410" />
                      <stop offset="100%" stopColor="#0c0a08" />
                    </radialGradient>

                    {/* Dégradé de la coche 3D */}
                    <linearGradient id="checkGold" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fff2d6" />
                      <stop offset="50%" stopColor="#d8b473" />
                      <stop offset="100%" stopColor="#8c6c33" />
                    </linearGradient>

                    {/* Dégradé piédestal */}
                    <linearGradient id="pedestalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#221e19" />
                      <stop offset="100%" stopColor="#0a0907" />
                    </linearGradient>
                  </defs>

                  {/* Piédestal sombre en bas */}
                  <ellipse cx="160" cy="275" rx="100" ry="24" fill="url(#pedestalGrad)" stroke="#c6a46a" strokeWidth="1" strokeOpacity="0.4" />
                  <ellipse cx="160" cy="270" rx="90" ry="18" fill="#12100d" />

                  {/* Cercle extérieur médaille */}
                  <circle cx="160" cy="140" r="110" fill="url(#goldOuter)" />
                  {/* Cercle creusé */}
                  <circle cx="160" cy="140" r="102" fill="url(#goldInner)" />
                  {/* Anneau intérieur fin */}
                  <circle cx="160" cy="140" r="92" fill="none" stroke="url(#goldOuter)" strokeWidth="2.5" strokeOpacity="0.6" />

                  {/* Coche dorée en relief (3D Checkmark) */}
                  <path
                    d="M115 140 L145 170 L210 105"
                    stroke="url(#checkGold)"
                    strokeWidth="22"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Reflet haut sur la coche */}
                  <path
                    d="M115 140 L145 170 L210 105"
                    stroke="#ffffff"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity="0.3"
                  />
                </svg>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ============ TIMELINE ET ÉTAPES (01, 02, 03) ============ */}
        <div className="mt-14 md:mt-20">
          <div className="relative flex flex-col gap-10 md:gap-12">
            {/* Ligne verticale dorée connectant les étapes */}
            <div className="pointer-events-none absolute left-[3.25rem] top-10 bottom-10 w-0.5 bg-gradient-to-b from-gold/80 via-gold/50 to-gold/20 hidden sm:block" />

            {/* ÉTAPE 01 */}
            <Reveal delay={0.1}>
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex items-center gap-4">
                  <span className="font-display text-2xl font-bold tracking-tight text-gold/90 sm:text-3xl sm:w-10">
                    01
                  </span>
                  <div className="grid size-14 place-items-center rounded-full border border-gold/40 bg-charcoal/90 text-gold shadow-md backdrop-blur-sm sm:size-16">
                    <Search className="size-6 text-gold-bright" />
                  </div>
                </div>

                <div className="sm:pl-4">
                  <h3 className="font-display text-xl font-bold uppercase tracking-wide text-cream sm:text-2xl">
                    SÉLECTIONNÉS
                  </h3>
                  <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
                    On choisit chaque produit à la main, pour sa fiabilité et son rapport qualité-prix.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Ligne de séparation fine entre items sur mobile */}
            <div className="h-px w-full bg-line sm:hidden" />

            {/* ÉTAPE 02 */}
            <Reveal delay={0.2}>
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex items-center gap-4">
                  <span className="font-display text-2xl font-bold tracking-tight text-gold/90 sm:text-3xl sm:w-10">
                    02
                  </span>
                  <div className="grid size-14 place-items-center rounded-full border border-gold/40 bg-charcoal/90 text-gold shadow-md backdrop-blur-sm sm:size-16">
                    <ClipboardCheck className="size-6 text-gold-bright" />
                  </div>
                </div>

                <div className="sm:pl-4">
                  <h3 className="font-display text-xl font-bold uppercase tracking-wide text-cream sm:text-2xl">
                    TESTÉS
                  </h3>
                  <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
                    On le met à l'épreuve en conditions réelles. S'il déçoit, il ne passe pas.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Ligne de séparation fine entre items sur mobile */}
            <div className="h-px w-full bg-line sm:hidden" />

            {/* ÉTAPE 03 */}
            <Reveal delay={0.3}>
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex items-center gap-4">
                  <span className="font-display text-2xl font-bold tracking-tight text-gold/90 sm:text-3xl sm:w-10">
                    03
                  </span>
                  <div className="grid size-14 place-items-center rounded-full border border-gold/40 bg-charcoal/90 text-gold shadow-md backdrop-blur-sm sm:size-16">
                    <ShieldCheck className="size-6 text-gold-bright" />
                  </div>
                </div>

                <div className="sm:pl-4">
                  <h3 className="font-display text-xl font-bold uppercase tracking-wide text-cream sm:text-2xl">
                    APPROUVÉS
                  </h3>
                  <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
                    Seul ce qu'on utiliserait nous-mêmes arrive jusqu'à vous.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* ============ BANNIÈRE CONFIANCE 3 COLONNES EN BAS ============ */}
        <Reveal delay={0.4}>
          <div className="mt-16 rounded-2xl border border-line bg-elevated/80 p-6 sm:p-8 backdrop-blur-md">
            <div className="grid gap-6 sm:grid-cols-3 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-line">
              {/* Carte 1 */}
              <div className="flex items-center justify-center gap-3.5 pt-4 sm:pt-0 sm:px-4 text-center sm:text-left">
                <Award className="size-6 text-gold shrink-0" />
                <span className="font-display text-xs font-bold uppercase tracking-wider text-cream sm:text-sm">
                  QUALITÉ CONTRÔLÉE
                </span>
              </div>

              {/* Carte 2 */}
              <div className="flex items-center justify-center gap-3.5 pt-4 sm:pt-0 sm:px-4 text-center sm:text-left">
                <ShieldCheck className="size-6 text-gold shrink-0" />
                <span className="font-display text-xs font-bold uppercase tracking-wider text-cream sm:text-sm">
                  PRODUITS FIABLES
                </span>
              </div>

              {/* Carte 3 */}
              <div className="flex items-center justify-center gap-3.5 pt-4 sm:pt-0 sm:px-4 text-center sm:text-left">
                <ThumbsUp className="size-6 text-gold shrink-0" />
                <span className="font-display text-xs font-bold uppercase tracking-wider text-cream sm:text-sm">
                  SATISFACTION GARANTIE
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
