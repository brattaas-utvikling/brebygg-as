// src/lib/seo/meta.ts
// Slår sammen side-spesifikk meta med globale standarder.

import { SITE_URL, SEO_DEFAULTS, type PageMeta } from "@config/site";

export type ResolvedMeta = Required<Omit<PageMeta, "ogImage">> & { ogImage: string };

export function resolveMeta(input: PageMeta): ResolvedMeta {
  const title       = input.title       || SEO_DEFAULTS.title;
  const description = input.description || SEO_DEFAULTS.description;

  if (import.meta.env.DEV) {
    if (title.length > 60)        console.warn(`[SEO] Tittel er ${title.length} tegn (maks 60): "${title}"`);
    if (description.length > 160) console.warn(`[SEO] Beskrivelse er ${description.length} tegn (maks 160): "${title}"`);
  }

  return {
    title,
    description,
    canonical: medSluttSkrastrek(input.canonical),
    ogImage:   input.ogImage  ?? SEO_DEFAULTS.ogImage,
    noindex:   input.noindex  ?? false,
    pageType:  input.pageType ?? "website",
  };
}

/** Sikrer konsistent trailing slash. Uten dette får vi duplikat-URL-er. */
function medSluttSkrastrek(url: string): string {
  if (url.endsWith("/")) return url;
  if (/\.[a-z0-9]{2,5}$/i.test(url)) return url;  // ikke på filendelser
  return `${url}/`;
}

/** Bygger absolutt URL fra relativ sti. Idempotent på absolutte URL-er. */
export function absoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = SITE_URL.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
