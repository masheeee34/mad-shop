import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

const GOOGLE_ENABLED = Boolean(GA_ID || GOOGLE_ADS_ID);

/**
 * Scripts de mesure et de publicité.
 *
 * Rien n'est injecté tant qu'aucun identifiant n'est configuré. Quand ils le
 * sont, le Consent Mode v2 de Google démarre en refus par défaut : les balises
 * se chargent mais n'écrivent aucun cookie tant que le visiteur n'a pas
 * accepté. C'est ce que Google exige depuis mars 2024 pour continuer à
 * remonter les conversions Ads dans l'Espace économique européen, et c'est
 * aussi ce qui rend la bannière de consentement conforme.
 */
export function Analytics() {
  if (!GOOGLE_ENABLED && !META_PIXEL_ID && !TIKTOK_PIXEL_ID) return null;

  const googleTagId = GA_ID ?? GOOGLE_ADS_ID;

  return (
    <>
      {GOOGLE_ENABLED && (
        <>
          {/* État de consentement défini avant tout autre appel gtag. */}
          <Script id="consent-default" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;

              var stored = null;
              try {
                var raw = localStorage.getItem('mad-consent');
                if (raw) stored = JSON.parse(raw).choice;
              } catch (e) {}

              var state = stored === 'granted' ? 'granted' : 'denied';
              gtag('consent', 'default', {
                ad_storage: state,
                ad_user_data: state,
                ad_personalization: state,
                analytics_storage: state,
                functionality_storage: 'granted',
                security_storage: 'granted',
                wait_for_update: 500
              });

              gtag('js', new Date());
              ${GA_ID ? `gtag('config', '${GA_ID}', { send_page_view: true });` : ""}
              ${GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : ""}
            `}
          </Script>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`}
            strategy="afterInteractive"
          />
        </>
      )}

      {META_PIXEL_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');

            var granted = false;
            try {
              var raw = localStorage.getItem('mad-consent');
              granted = !!raw && JSON.parse(raw).choice === 'granted';
            } catch (e) {}

            if (!granted) fbq('consent', 'revoke');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {TIKTOK_PIXEL_ID && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
              ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
              ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
              for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
              ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
              ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js";
                ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
                ttq._o=ttq._o||{};ttq._o[e]=n||{};
                var o=d.createElement("script");o.type="text/javascript";o.async=!0;o.src=r+"?sdkid="+e+"&lib="+t;
                var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};

              var granted = false;
              try {
                var raw = localStorage.getItem('mad-consent');
                granted = !!raw && JSON.parse(raw).choice === 'granted';
              } catch (e) {}

              ttq.load('${TIKTOK_PIXEL_ID}');
              if (!granted) ttq.disableCookie();
              ttq.page();
            }(window, document, 'ttq');
          `}
        </Script>
      )}
    </>
  );
}
