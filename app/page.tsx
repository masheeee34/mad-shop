import { ArrowRight, ShieldCheck, BadgeCheck, Truck, MapPin } from "lucide-react";
import { getProducts, getProduct } from "@/lib/data/catalog";
import { ProductImage } from "@/components/product/product-image";
import { ProductSlider } from "@/components/product/product-slider";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/parallax";
import { LogoWatermark } from "@/components/brand/logo-watermark";
import { ExigenceSection } from "@/components/home/exigence-section";

export const revalidate = 60;

const pillars = [
  { title: "Sélectionnés", text: "On choisit chaque produit à la main, pour sa fiabilité et son rapport qualité-prix." },
  { title: "Testés", text: "On le met à l'épreuve en conditions réelles. S'il déçoit, il ne passe pas." },
  { title: "Approuvés", text: "Seul ce qu'on utiliserait nous-mêmes arrive jusqu'à vous." },
];

export default async function HomePage() {
  const products = await getProducts();
  const spotlight = (await getProduct("tracker-gps")) ?? products[0];

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden pt-28 pb-16 md:pt-40 md:pb-28">
        <LogoWatermark
          className="left-[-16rem] top-1/2 h-[42rem] w-[42rem] -translate-y-1/2 md:left-[-12rem]"
          opacity={0.06}
        />
        <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-gold/10 blur-[120px]" />
        <div className="relative shell grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-muted">
                <span className="tricolore" style={{ width: 22, height: 2 }} />
                Testé & approuvé
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="display mt-5 text-[2.6rem] leading-[0.95] sm:text-6xl md:text-7xl">
                La qualité
                <br />
                <span className="text-gold-gradient">à petit prix.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-5 max-w-md text-base leading-relaxed text-muted sm:text-lg">
                Audio, sécurité et objets connectés. Nous sélectionnons,
                testons et approuvons chaque produit avant de vous le proposer.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <ButtonLink href="/boutique" size="lg">
                  Découvrir la boutique <ArrowRight className="size-4" />
                </ButtonLink>
                <ButtonLink href="/a-propos" variant="ghost" size="lg" className="link-underline px-2">
                  Notre démarche
                </ButtonLink>
              </div>
            </Reveal>
            <Reveal delay={0.32}>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2.5 text-sm text-muted">
                <span className="flex items-center gap-2"><Truck className="size-4 text-gold" /> Livraison 24-48h</span>
                <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-gold" /> Satisfait ou remboursé</span>
                <span className="flex items-center gap-2"><MapPin className="size-4 text-gold" /> France & Europe</span>
              </div>
            </Reveal>
          </div>

          {/* Image hero — masquée sur très petits écrans pour priorité au texte */}
          <Reveal delay={0.2} y={40}>
            <Parallax amount={28} className="relative">
              <div className="card relative aspect-square overflow-hidden">
                <ProductImage
                  file="hero.jpg"
                  alt="Sélection de produits MAD Shop"
                  label="MAD Shop"
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
              </div>
            </Parallax>
          </Reveal>
        </div>
      </section>

      {/* ============ EXIGENCE (MAQUETTE DU CLIENT) ============ */}
      <ExigenceSection />

      {/* ============ BEST-SELLERS ============ */}
      <section className="shell py-12 md:py-16">
        <ProductSlider
          products={products}
          eyebrow="La sélection"
          title="Nos incontournables"
        />
      </section>

      {/* ============ SPOTLIGHT ============ */}
      <section className="shell py-10 md:py-16">
        <div className="card grid overflow-hidden lg:grid-cols-2">
          <div className="relative min-h-64 bg-elevated sm:min-h-72">
            <ProductImage
              file={spotlight.images[0]}
              alt={spotlight.name}
              label={spotlight.name}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col justify-center gap-4 p-6 sm:p-8 md:p-12">
            <Reveal>
              <span className="text-xs uppercase tracking-[0.25em] text-gold">
                {spotlight.badge} · {spotlight.category}
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="display text-2xl sm:text-3xl md:text-4xl">{spotlight.tagline}</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="max-w-md text-sm text-muted sm:text-base">{spotlight.description[0]}</p>
            </Reveal>
            <Reveal delay={0.15}>
              <ul className="grid gap-2 sm:grid-cols-2">
                {spotlight.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-sm text-cream">
                    <BadgeCheck className="size-4 shrink-0 text-gold" /> {h}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="pt-2">
                <ButtonLink href={`/produit/${spotlight.slug}`} size="lg">
                  Voir le produit <ArrowRight className="size-4" />
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ BANNIÈRE CONFIANCE ============ */}
      <section className="shell py-10 md:py-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-charcoal to-ink p-7 text-center sm:rounded-3xl sm:p-10 md:p-16">
            <div className="pointer-events-none absolute inset-x-0 -top-1/2 h-full bg-gold/5 blur-3xl" />
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Notre engagement</p>
            <h2 className="display mx-auto mt-4 max-w-3xl text-2xl sm:text-3xl md:text-5xl">
              La <span className="text-gold-gradient">confiance</span>, notre priorité.
              Votre <span className="text-gold-gradient">satisfaction</span>, notre mission.
            </h2>
            <div className="mt-7 flex justify-center">
              <ButtonLink href="/boutique" size="lg">
                Explorer les produits <ArrowRight className="size-4" />
              </ButtonLink>
            </div>
            <span className="tricolore mx-auto mt-8 block max-w-xs" aria-hidden />
          </div>
        </Reveal>
      </section>
    </>
  );
}
