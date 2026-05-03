// astro.config.mjs
// BRE Bygg AS — brebygg.no
// Astro v5, Tailwind v4 via @tailwindcss/vite (ikke @astrojs/tailwind)

import { defineConfig } from "astro/config";
import react            from "@astrojs/react";
import sitemap          from "@astrojs/sitemap";
import vercel           from "@astrojs/vercel";
import tailwindcss      from "@tailwindcss/vite";

export default defineConfig({
  site:   "https://brebygg.no",
  output: "static",

  adapter: vercel({
    webAnalytics: { enabled: true },
  }),

  integrations: [
    react(),

    sitemap({
      customPages: [
        "https://brebygg.no/",
        "https://brebygg.no/om-oss/",
        "https://brebygg.no/prosjekter/",
        "https://brebygg.no/kontakt/",
      ],
      serialize(item) {
        if (item.url === "https://brebygg.no/")
          return { ...item, priority: 1.0, changefreq: "weekly" };
        if (item.url.includes("/prosjekter/") && item.url !== "https://brebygg.no/prosjekter/")
          return { ...item, priority: 0.8, changefreq: "monthly" };
        if (item.url === "https://brebygg.no/prosjekter/" || item.url === "https://brebygg.no/om-oss/")
          return { ...item, priority: 0.9, changefreq: "monthly" };
        if (item.url === "https://brebygg.no/kontakt/")
          return { ...item, priority: 0.7, changefreq: "yearly" };
        return { ...item, priority: 0.6, changefreq: "monthly" };
      },
      filter(page) {
        return !page.includes("404");
      },
    }),
  ],

  image: {
    defaultFormat: "webp",
    formats:       ["webp", "avif"],
    quality:       82,
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },

  compressHTML: true,

  vite: {
    // Tailwind v4 bruker Vite-plugin, ikke Astro-integrasjon
    plugins: [tailwindcss()],
  },
});
