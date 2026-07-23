import { ArrowRight, ShieldCheck, BadgeCheck, Truck, MapPin } from "lucide-react";
import { getProducts, getProduct } from "@/lib/data/catalog";
import { ProductImage } from "@/components/product/product-image";
import { ProductSlider } from "@/components/product/product-slider";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/parallax";

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
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-gold/10 blur-[120px]" />
        <div className="shell grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-muted">
                <span className="tricolore" style={{ width: 22, height: 2 }} />
                Testé & approuvé
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="display mt-6 text-5xl sm:text-6xl md:text-7xl">
                La qualité
                <br />
                <span className="text-gold-gradient">à petit prix.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
                Audio, sécurité et objets connectés. Nous sélectionnons,
                testons et approuvons chaque produit avant de vous le proposer.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <ButtonLink href="/boutique" size="lg">
                  Découvrir la boutique <ArrowRight className="size-4" />
                </ButtonLink>
                <ButtonLink href="/a-propos" variant="ghost" size="lg" className="link-underline px-2">
                  Notre démarche
                </ButtonLink>
              </div>
            </Reveal>
            <Reveal delay={0.32}>
              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted">
                <span className="flex items-center gap-2"><Truck className="size-4 text-gold" /> Livraison 24-48h</span>
                <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-gold" /> Satisfait ou remboursé</span>
                <span className="flex items-center gap-2"><MapPin className="size-4 text-gold" /> France & Europe</span>
              </div>
            </Reveal>
          </div>

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

      {/* ============ EXIGENCE (séquence éditoriale) ============ */}
      <section className="shell py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Notre exigence</p>
            <h2 className="display mt-5 text-4xl leading-[0.95] md:text-5xl">
              Rien n'entre au catalogue sans être <span className="text-gold-gradient">approuvé.</span>
            </h2>
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-muted">
              Chaque référence passe par trois étapes, dans cet ordre. Sans
              raccourci — c'est ce qui fait la différence.
            </p>
          </Reveal>

          <div className="flex flex-col">
            {pillars.map(({ title, text }, i) => (
              <Reveal key={title} delay={i * 0.08}>
                <div className="group flex items-baseline gap-6 border-t border-line py-7 transition-colors duration-500 hover:border-gold/40 md:gap-10 md:py-9">
                  <span className="font-display text-2xl font-semibold text-faint transition-colors duration-500 group-hover:text-gold md:text-3xl">
                    0{i + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-display text-2xl font-semibold uppercase tracking-tight md:text-3xl">
                      {title}
                    </h3>
                    <p className="mt-2 max-w-md leading-relaxed text-muted">{text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
            <div className="border-t border-line" />
          </div>
        </div>
      </section>

      {/* ============ BEST-SELLERS (slider) ============ */}
      <section className="shell py-16">
        <ProductSlider
          products={products}
          eyebrow="La sélection"
          title="Nos incontournables"
        />
      </section>

      {/* ============ SPOTLIGHT ============ */}
      <section className="shell py-16">
        <div className="card grid overflow-hidden lg:grid-cols-2">
          <div className="relative min-h-72 bg-elevated">
            <ProductImage
              file={spotlight.images[0]}
              alt={spotlight.name}
              label={spotlight.name}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col justify-center gap-5 p-8 md:p-12">
            <Reveal>
              <span className="text-xs uppercase tracking-[0.25em] text-gold">
                {spotlight.badge} · {spotlight.category}
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="display text-3xl md:text-4xl">{spotlight.tagline}</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="max-w-md text-muted">{spotlight.description[0]}</p>
            </Reveal>
            <Reveal delay={0.15}>
              <ul className="grid gap-2 sm:grid-cols-2">
                {spotlight.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-sm text-cream">
                    <BadgeCheck className="size-4 text-gold" /> {h}
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
      <section className="shell py-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-charcoal to-ink p-10 text-center md:p-16">
            <div className="pointer-events-none absolute inset-x-0 -top-1/2 h-full bg-gold/5 blur-3xl" />
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Notre engagement</p>
            <h2 className="display mx-auto mt-4 max-w-3xl text-3xl md:text-5xl">
              La <span className="text-gold-gradient">confiance</span>, notre priorité.
              Votre <span className="text-gold-gradient">satisfaction</span>, notre mission.
            </h2>
            <div className="mt-8 flex justify-center">
              <ButtonLink href="/boutique" size="lg">
                Explorer les produits <ArrowRight className="size-4" />
              </ButtonLink>
            </div>
            <span className="tricolore mx-auto mt-10 block max-w-xs" aria-hidden />
          </div>
        </Reveal>
      </section>
    </>
  );
}
