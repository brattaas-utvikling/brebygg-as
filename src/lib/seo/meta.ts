// src/lib/seo/meta.ts
// Genererer konsistente <title>, <meta description> og Open Graph-tags.
// Brukes av BaseLayout.astro.

import { SITE_URL, SEO_DEFAULTS } from "@config/site";

export type MetaInput = {
  title?:       string;
  description?: string;
  canonical:    string;
  ogImage?:     string;
  noindex?:     boolean;
  // Schema-type hint for BaseLayout
  pageType?:    "website" | "article";
};

export type ResolvedMeta = {
  title:        string;
  description:  string;
  canonical:    string;
  ogImage:      string;
  noindex:      boolean;
  pageType:     "website" | "article";
};

/**
 * Slår sammen side-spesifikke meta-data med globale standarder.
 * Titler over 60 tegn gir advarsel i development.
 */
export function resolveMeta(input: MetaInput): ResolvedMeta {
  const title       = input.title       ?? SEO_DEFAULTS.title;
  const description = input.description ?? SEO_DEFAULTS.description;
  const ogImage     = input.ogImage     ?? SEO_DEFAULTS.ogImage;

  if (import.meta.env.DEV && title.length > 60) {
    console.warn(`[SEO] Tittelen er ${title.length} tegn (maks 60): "${title}"`);
  }

  if (import.meta.env.DEV && description.length > 160) {
    console.warn(`[SEO] Beskrivelsen er ${description.length} tegn (maks 160).`);
  }

  return {
    title,
    description,
    canonical:  ensureTrailingSlash(input.canonical),
    ogImage,
    noindex:    input.noindex  ?? false,
    pageType:   input.pageType ?? "website",
  };
}

/**
 * Sikrer at kanoniske URL-er alltid har trailing slash.
 * Konsistens er viktig for å unngå duplikatinnhold.
 */
function ensureTrailingSlash(url: string): string {
  if (url.endsWith("/")) return url;
  // Ikke legg til slash på URL-er med filendelse
  if (/\.[a-z]{2,4}$/i.test(url)) return url;
  return url + "/";
}

/**
 * Bygger absolutt URL fra en relativ sti.
 */
export function absoluteUrl(path: string): string {
  const base = SITE_URL.endsWith("/") ? SITE_URL.slice(0, -1) : SITE_URL;
  const p    = path.startsWith("/")   ? path : `/${path}`;
  return `${base}${p}`;
}
