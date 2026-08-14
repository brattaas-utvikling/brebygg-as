// astro.config.mjs — BRE Bygg AS, brebygg.no
// Astro 7 · React 19 · statisk output på Vercel
//
// Endringer fra v1:
//   - Tailwind fjernet. CSS-variabler i globals.css er eneste sannhet.
//   - image.{defaultFormat,formats,quality} fjernet — ikke gyldige Astro-nøkler,
//     ble ignorert i stillhet og ga falsk trygghet om at bilder ble optimalisert.
//   - fonts[] lagt til: Plus Jakarta Sans selvhostes. Fjerner den døde @import-en
//     i globals.css, begge preconnect-ene, media="print"-hacken og FOUT.
//   - sitemap.customPages fjernet — de fire rutene genereres allerede.
//   - compressHTML: true beholdes eksplisitt. Astro 7 endret standarden til 'jsx',
//     som stripper mellomrom mellom inline-elementer. Migreres som egen endring.

import { defineConfig, fontProviders } from "astro/config";
import { loadEnv } from "vite";
import react   from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import vercel  from "@astrojs/vercel";
import sanity  from "@sanity/astro";

const SITE = "https://brebygg.no";

// Kildebryteren, samme prinsipp som i src/content.config.ts.
//
// @sanity/astro oppretter sin egen klient ved oppstart og kaster
// «Configuration must contain projectId» hvis den er tom. Integrasjonen må
// derfor legges til betinget, ikke bare konfigureres betinget — ellers kan
// ikke prosjektet bygges før .env er fylt ut.
// loadEnv og ikke process.env: astro.config.mjs kjøres FØR Astro laster .env
// inn i import.meta.env, så process.env inneholder bare det skallet har satt.
// Med process.env var PUBLIC_SANITY_PROJECT_ID alltid undefined her, og
// sanity()-integrasjonen ble derfor aldri lagt til — /studio ga 404 selv med
// riktig projectId i .env.
const env = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "");

const SANITY_PROJECT_ID = env.PUBLIC_SANITY_PROJECT_ID ?? "";
const SANITY_DATASET    = env.PUBLIC_SANITY_DATASET ?? "production";
const BRUKER_SANITY     = SANITY_PROJECT_ID.length > 0;

export default defineConfig({
  site: SITE,
  output: "static",

  adapter: vercel({
    webAnalytics: { enabled: true },
  }),

  compressHTML: true,

  fonts: [
    {
      provider:    fontProviders.google(),
      name:        "Plus Jakarta Sans",
      cssVariable: "--font-jakarta",
      weights:     [400, 500, 600, 700, 800],
      styles:      ["normal"],
      subsets:     ["latin", "latin-ext"],
      display:     "swap",
      // Genererer en metrisk justert fallback slik at layouten ikke hopper
      // mellom fallback-font og webfont.
      optimizedFallbacks: true,
      fallbacks: ["system-ui", "sans-serif"],
    },
  ],

  integrations: [
    react(),

    // Studio på /studio. studioBasePath må matche basePath i sanity.config.ts.
    // useCdn: false — vi vil ha nyeste innhold rett etter publisering, ikke
    // det som lå i kanten for fem minutter siden.
    ...(BRUKER_SANITY
      ? [sanity({
          projectId:      SANITY_PROJECT_ID,
          dataset:        SANITY_DATASET,
          useCdn:         false,
          studioBasePath: "/studio",
        })]
      : []),

    sitemap({
      serialize(item) {
        const path = item.url.replace(SITE, "");
        if (path === "/")                    return { ...item, priority: 1.0, changefreq: "weekly"  };
        if (path === "/prosjekter/")         return { ...item, priority: 0.9, changefreq: "monthly" };
        if (path === "/om-oss/")             return { ...item, priority: 0.8, changefreq: "yearly"  };
        if (path === "/kontakt/")            return { ...item, priority: 0.7, changefreq: "yearly"  };
        if (path.startsWith("/tjenester/"))  return { ...item, priority: 0.9, changefreq: "monthly" };
        if (path.startsWith("/prosjekter/")) return { ...item, priority: 0.8, changefreq: "monthly" };
        return { ...item, priority: 0.6, changefreq: "monthly" };
      },
      // Studio skal aldri i sitemapet, og heller ikke 404.
      filter: (page) => !page.includes("404") && !page.includes("/studio"),
    }),
  ],

  image: {
    // Sanity CDN leverer og transformerer bilder — se §3.5 i migreringsplanen.
    // remotePatterns kreves likevel for at <Image> skal godta cdn.sanity.io
    // dersom vi senere velger byggetidsprosessering for enkeltbilder.
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
});
