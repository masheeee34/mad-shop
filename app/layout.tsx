import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/layout/site-chrome";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { IntroLoader } from "@/components/brand/intro-loader";
import { Analytics } from "@/components/analytics";

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://madshop.fr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MAD Shop — La qualité à petit prix",
    template: "%s · MAD Shop",
  },
  description:
    "Audio, sécurité et objets connectés testés et approuvés. Livraison 24-48h en France et en Europe. Satisfait ou remboursé.",
  keywords: ["MAD Shop", "AirPods", "tracker GPS", "caméra", "boutique", "audio"],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "MAD Shop",
    title: "MAD Shop — La qualité à petit prix",
    description:
      "Audio, sécurité et objets connectés testés et approuvés. Livraison 24-48h.",
    url: siteUrl,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
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
        {/* Viewport mobile complet — viewport-fit=cover pour les encoches iPhone */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        {/* Couleur de la barre de statut mobile */}
        <meta name="theme-color" content="#0b0b0c" />
        <meta name="theme-color" content="#0b0b0c" media="(prefers-color-scheme: dark)" />
        {/* PWA iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MAD Shop" />
        {/* Service Worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-ink text-cream" suppressHydrationWarning>
        <IntroLoader />
        <SmoothScroll />
        <SiteChrome>{children}</SiteChrome>
        <Analytics />
      </body>
    </html>
  );
}
