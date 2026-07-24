/* ============================================================
   Catalogue MAD SHOP — source de vérité unique.
   Prix en centimes (49,90 € => 4990).
   Pour modifier prix / textes / photos : tout est ici.
   Dépose les vraies photos dans /public/products/<image>.
   ============================================================ */

export type ProductFeature = {
  title: string;
  detail: string;
};

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  category: "Audio" | "Sécurité" | "Connecté";
  priceCents: number;
  compareAtCents?: number;
  badge?: string;
  shortDescription: string;
  description: string[];
  features: ProductFeature[];
  highlights: string[];
  /** Fichiers attendus dans /public/products/ */
  images: string[];
  inStock: boolean;
  stockQuantity?: number;
  /** ID de prix Stripe (optionnel — sinon prix dynamique). */
  stripePriceId?: string;
};

/** Catalogue par défaut (seed). En prod, la source runtime est data/catalog.json. */
export const defaultProducts: Product[] = [
  {
    slug: "airpods-max",
    name: "AirPods Max — Réplique Premium",
    tagline: "Le style. Le son. Partout.",
    category: "Audio",
    priceCents: 4990,
    compareAtCents: 7990,
    badge: "Best-seller",
    shortDescription:
      "Casque circum-auriculaire, son haute qualité et confort ultra léger.",
    description: [
      "Une réplique premium pensée pour ceux qui veulent le style et le son, sans le prix. Finition soignée, coussinets respirants et arceau ajustable pour un confort qui tient toute la journée.",
      "Connexion Bluetooth 5.3 stable, compatible iOS & Android. Fourni avec sa housse de transport souple.",
    ],
    features: [
      { title: "Son haute qualité", detail: "Clair, puissant, équilibré." },
      { title: "Connexion Bluetooth 5.3", detail: "Stable et sans interruption." },
      { title: "Autonomie longue durée", detail: "Des heures d'écoute continue." },
      { title: "Confort ultra léger", detail: "Coussinets moelleux, arceau ajusté." },
    ],
    highlights: ["Bluetooth 5.3", "iOS & Android", "Housse incluse"],
    images: ["airpods-max-1.jpg"],
    inStock: true,
    stockQuantity: 15,
  },
  {
    slug: "airpods-3",
    name: "AirPods 3 — Réplique Premium",
    tagline: "De la qualité à petit prix.",
    category: "Audio",
    priceCents: 3490,
    compareAtCents: 5490,
    shortDescription:
      "Écouteurs sans fil, son immersif et commandes tactiles intuitives.",
    description: [
      "Des écouteurs légers et bien ajustés qui disparaissent une fois en place. Son immersif, appels nets grâce au micro intégré, et boîtier de charge compact.",
      "L'appairage est instantané et la connexion reste stable, même en mouvement.",
    ],
    features: [
      { title: "Son immersif", detail: "Clair, puissant, équilibré." },
      { title: "Connexion rapide", detail: "Stable et sans interruption." },
      { title: "Autonomie optimisée", detail: "Écoute prolongée avec le boîtier." },
      { title: "Commande tactile", detail: "Contrôle intuitif du bout du doigt." },
      { title: "Confort absolu", detail: "Légers et bien ajustés." },
      { title: "Micro intégré", detail: "Appels clairs et nets." },
    ],
    highlights: ["Boîtier de charge", "Tactile", "Micro intégré"],
    images: ["airpods-3-1.jpg"],
    inStock: true,
    stockQuantity: 25,
  },
  {
    slug: "camera-surveillance",
    name: "Caméra Vidéo Surveillance",
    tagline: "Gardez un œil, où que vous soyez.",
    category: "Sécurité",
    priceCents: 3990,
    compareAtCents: 5990,
    badge: "Nouveau",
    shortDescription:
      "Caméra Wi-Fi compacte, longue durée, idéale bureau ou chambre.",
    description: [
      "Une caméra discrète et fiable pour surveiller votre intérieur. Installation en quelques minutes, connexion Wi-Fi stable et bonne autonomie de batterie.",
      "Idéale pour le bureau, la chambre ou toute autre pièce à garder à l'œil.",
    ],
    features: [
      { title: "Caméra longue durée", detail: "Enregistrement fiable dans le temps." },
      { title: "Wi-Fi de qualité", detail: "Connexion stable à votre réseau." },
      { title: "Extrêmement fiable", detail: "Conçue pour tourner en continu." },
      { title: "Polyvalente", detail: "Bureau, chambre ou toute autre pièce." },
      { title: "Bonne autonomie", detail: "Batterie longue durée intégrée." },
    ],
    highlights: ["Wi-Fi", "Sur batterie", "Discrète"],
    images: ["camera-1.jpg"],
    inStock: true,
    stockQuantity: 10,
  },
  {
    slug: "tracker-gps",
    name: "Tracker GPS",
    tagline: "Suivez, localisez, soyez tranquille.",
    category: "Sécurité",
    priceCents: 4490,
    compareAtCents: 6990,
    badge: "Top vente",
    shortDescription:
      "Localisation temps réel, sans abonnement, jusqu'à 6 mois d'autonomie.",
    description: [
      "Une technologie fiable pour protéger vos biens et ceux que vous aimez. Suivi GPS précis en temps réel via l'application mobile, sans aucun frais mensuel.",
      "Fixation magnétique puissante pour une utilisation immédiate. Résistant à l'eau et facile à dissimuler.",
    ],
    features: [
      { title: "Suivi GPS précis", detail: "Localisation temps réel via l'app mobile." },
      { title: "Batterie longue durée", detail: "Jusqu'à 6 mois d'autonomie en veille." },
      { title: "Sans abonnement", detail: "Aucun frais mensuel, aucun engagement." },
      { title: "Installation facile", detail: "Fixation magnétique puissante." },
      { title: "Alerte intelligente", detail: "Mouvement, sortie de zone, batterie faible." },
      { title: "Résistant et discret", detail: "Étanche et facile à cacher." },
    ],
    highlights: ["Sans abonnement", "Jusqu'à 6 mois", "Temps réel"],
    images: ["tracker-gps-1.jpg"],
    inStock: true,
    stockQuantity: 12,
  },
];

export const categories = ["Audio", "Sécurité", "Connecté"] as const;
