import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Space_Grotesk, Manrope } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/layout/site-chrome";

import { Analytics } from "@/components/analytics";
import { ConsentBanner } from "@/components/consent-banner";
import { BRAND_NAME, BRAND_TAGLINE, SITE_URL } from "@/lib/config";
import { organizationJsonLd, websiteJsonLd, jsonLdScript } from "@/lib/seo";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const DESCRIPTION =
  "Audio, sécurité et objets connectés sélectionnés, testés et approuvés. " +
  "Livraison 24-48 h en France et en Europe. Satisfait ou remboursé sous 14 jours.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND_NAME} — ${BRAND_TAGLINE}`,
    template: `%s · ${BRAND_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: BRAND_NAME,
  keywords: [
    "MAD Shop",
    "casque audio",
    "écouteurs sans fil",
    "tracker GPS sans abonnement",
    "caméra de surveillance wifi",
    "objets connectés",
    "boutique en ligne France",
  ],
  authors: [{ name: BRAND_NAME, url: SITE_URL }],
  creator: BRAND_NAME,
  publisher: BRAND_NAME,
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": [{ url: "/feed.xml", title: `${BRAND_NAME} — flux produits` }] },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: BRAND_NAME,
    title: `${BRAND_NAME} — ${BRAND_TAGLINE}`,
    description: DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_NAME} — ${BRAND_TAGLINE}`,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
    verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION },
  }),
  formatDetection: { telephone: false },
  appleWebApp: {
    capable: true,
    title: BRAND_NAME,
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b0b0c",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${spaceGrotesk.variable} ${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Ouvre la connexion à Stripe avant le clic sur « payer ». */}
        <link rel="preconnect" href="https://js.stripe.com" />
        <link rel="dns-prefetch" href="https://js.stripe.com" />

        {/* Identité de la boutique et moteur de recherche interne. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(organizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(websiteJsonLd()) }}
        />
        <Script
          id="sw-cleanup"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function (regs) {
                  var needsReload = false;
                  for (var i = 0; i < regs.length; i++) {
                    regs[i].unregister();
                    needsReload = true;
                  }
                  if (needsReload) window.location.reload();
                });
              }
              if (window.caches && caches.keys) {
                caches.keys().then(function (keys) {
                  for (var i = 0; i < keys.length; i++) {
                    caches.delete(keys[i]);
                  }
                });
              }
            `
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-ink text-cream" suppressHydrationWarning>
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-cream focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-ink"
        >
          Aller au contenu
        </a>


        <SiteChrome>{children}</SiteChrome>
        <ConsentBanner />
        <Analytics />

        {/*
          Nettoyage du Service Worker.

          L'ancien SW mettait des pages en cache et interceptait les
          navigations : après chaque redéploiement, il servait des pages
          périmées pointant vers des fichiers JS disparus, d'où les écrans
          « This page couldn't load » et « Une petite interruption ».

          On le désinscrit et on purge tous ses caches, sans jamais le
          réenregistrer. Le site fonctionne parfaitement sans (servi par le
          CDN). Un SW testé pourra être réintroduit plus tard.
        */}

      </body>
    </html>
  );
}
