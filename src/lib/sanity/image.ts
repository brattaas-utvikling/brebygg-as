// src/lib/sanity/image.ts
//
// Bilde-URL-er via Sanitys transformasjons-CDN.
//
// Valget mot Astros byggetidsprosessering er bevisst: med et bildebibliotek
// klienten fyller på jevnlig, ville sharp lastet ned og transformert hvert
// bilde ved hvert bygg. Byggetiden ville vokst lineært med bildebiblioteket.
// Sanitys CDN holder byggetiden flat og serverer fra kant.

import { createImageUrlBuilder } from "@sanity/image-url";
import type { Image } from "@sanity/types";
import { SANITY_PROJECT_ID, SANITY_DATASET } from "./client";

const bygger = createImageUrlBuilder({ projectId: SANITY_PROJECT_ID, dataset: SANITY_DATASET });

/** Standardbredder for srcset. Dekker mobil til 2× på store skjermer. */
export const BREDDER = [400, 800, 1200, 1600, 2000] as const;

export function bildeUrl(kilde: Image, bredde: number, kvalitet = 78): string {
  return bygger
    .image(kilde)
    .width(bredde)
    .quality(kvalitet)
    // auto=format gir AVIF der nettleseren støtter det, ellers WebP.
    .auto("format")
    // fit=max skalerer aldri opp — et bilde lastet opp i 900 px blir ikke
    // strukket til 2000.
    .fit("max")
    .url();
}

export function byggSrcset(kilde: Image, maksBredde = 2000): string {
  return BREDDER
    .filter((b) => b <= maksBredde)
    .map((b) => `${bildeUrl(kilde, b)} ${b}w`)
    .join(", ");
}

export type BildeMeta = {
  dimensions?: { width: number; height: number; aspectRatio: number };
  /** Base64 20×20-forhåndsvisning fra Sanity. Gir blur-up uten ekstra forespørsel. */
  lqip?: string;
};

/**
 * Attributter for <link rel="preload"> som matcher det <SanityBilde> faktisk
 * ber om.
 *
 * Bakgrunn: BaseLayout preloadet den utransformerte asset-URL-en, mens
 * SanityBilde henter transformerte varianter med ?w=…&auto=format. To ulike
 * URL-er, altså to nedlastinger — originalen på 1624 px ble lastet ned og
 * aldri brukt. Nettleseren advarte om det i konsollen.
 *
 * imagesrcset og imagesizes må være identiske med dem på <img>, ellers velger
 * preload-en en annen kandidat enn bildet gjør.
 */
export function heroPreload(
  kilde: Image & { asset?: { metadata?: { dimensions?: { width: number } } } },
  sizes: string,
): { href: string; imagesrcset: string; imagesizes: string } | null {
  if (!kilde?.asset) return null;
  const maksBredde = kilde.asset.metadata?.dimensions?.width ?? 2000;
  return {
    href:        bildeUrl(kilde, Math.min(1200, maksBredde)),
    imagesrcset: byggSrcset(kilde, maksBredde),
    imagesizes:  sizes,
  };
}
