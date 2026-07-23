import type { Metadata } from "next";
import { Search, ShieldCheck, BadgeCheck, Truck, Lock, Headphones, Heart } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "MAD Shop sélectionne, teste et approuve chaque produit. Notre mission : la qualité à petit prix, avec un service de confiance.",
};

const steps = [
  { icon: Search, title: "Sélectionnés", text: "Nous choisissons chaque produit avec soin, pour sa fiabilité et son rapport qualité-prix." },
  { icon: ShieldCheck, title: "Testés", text: "Chaque référence est testée en conditions réelles avant d'entrer au catalogue." },
  { icon: BadgeCheck, title: "Approuvés", text: "Seul le meilleur est retenu. Si nous ne l'utiliserions pas, nous ne le vendons pas." },
];

const values = [
  { icon: Truck, title: "Livraison rapide", text: "24-48h partout en France et en Europe." },
  { icon: Lock, title: "Paiement sécurisé", text: "Transactions cryptées via Stripe." },
  { icon: Headphones, title: "Service à l'écoute", text: "Une équipe réactive, avant et après l'achat." },
  { icon: Heart, title: "Satisfaction garantie", text: "Satisfait ou remboursé sous 14 jours." },
];

export default function AboutPage() {
  return (
    <div className="pt-32 md:pt-40">
      <section className="shell">
        <Reveal>
          <span className="gold-rule" />
          <h1 className="display mt-3 max-w-3xl text-4xl md:text-6xl">
            Chez MAD Shop, la qualité <span className="text-gold-gradient">à petit prix.</span>
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            MAD Shop est né d'une conviction simple : on ne devrait pas avoir à
            choisir entre qualité et budget. Nous sélectionnons, testons et
            approuvons chaque produit avant de vous le proposer — de l'audio à la
            sécurité, en passant par les objets connectés.
          </p>
        </Reveal>
      </section>

      <section className="shell mt-20">
        <Stagger className="grid gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }) => (
            <StaggerItem key={title}>
              <div className="card h-full p-8">
                <span className="grid size-12 place-items-center rounded-full border border-line text-gold">
                  <Icon className="size-6" />
                </span>
                <h2 className="mt-5 font-display text-xl font-semibold uppercase tracking-wide">
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="shell mt-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-charcoal to-ink p-10 md:p-16">
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Notre promesse</p>
            <h2 className="display mt-4 max-w-3xl text-3xl md:text-4xl">
              La confiance, notre priorité. Votre satisfaction, notre mission.
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map(({ icon: Icon, title, text }) => (
                <div key={title}>
                  <Icon className="size-6 text-gold" />
                  <h3 className="mt-3 font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="shell mt-16 text-center">
        <Reveal>
          <h2 className="display text-2xl md:text-3xl">Prêt à découvrir la sélection ?</h2>
          <div className="mt-6 flex justify-center">
            <ButtonLink href="/boutique" size="lg">Voir la boutique</ButtonLink>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
