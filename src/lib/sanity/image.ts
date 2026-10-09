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
import { erSanityBilde, type Bilde } from "@/content/skjema";

const bygger = createImageUrlBuilder({ projectId: SANITY_PROJECT_ID, dataset: SANITY_DATASET });

/** Standardbredder for srcset. Dekker mobil til 2× på store skjermer. 600 fordi
    karusellkortene (280 px) på 2×-mobil ellers hoppet fra 400 rett til 800. */
export const BREDDER = [400, 600, 800, 1200, 1600, 2000] as const;

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

/**
 * Beskåret til fast forhold rundt hotspot. For portretter, der alle må ha
 * samme format uansett hva som ble lastet opp. fit=crop respekterer utsnittet
 * kunden velger i Studio.
 */
export function beskaretUrl(kilde: Image, bredde: number, hoyde: number, kvalitet = 80): string {
  return bygger.image(kilde).width(bredde).height(hoyde).fit("crop").quality(kvalitet).auto("format").url();
}

/**
 * Standardbreddene opp til originalen, pluss originalen selv.
 *
 * Uten originalen fikk et bilde på 768 px bare 400w i srcset, fordi 800 er
 * større enn originalen. Nettleseren valgte da 400 px også der bildet vises
 * i full størrelse (lysboksen), og det ble uskarpt.
 */
export function byggSrcset(kilde: Image, maksBredde = 2000): string {
  const bredder: number[] = BREDDER.filter((b) => b <= maksBredde);
  if (maksBredde > (bredder.at(-1) ?? 0) && maksBredde <= Math.max(...BREDDER)) bredder.push(maksBredde);
  return bredder
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

/**
 * Delingsbilde (og:image, twitter:image, JSON-LD) i 1200×630, som Facebook og
 * LinkedIn forventer. Beskåret rundt hotspot. JPG og ikke auto=format: noen
 * delingstjenester viser ikke WebP/AVIF.
 *
 * Erstatter `${SITE_URL}${bildeSrc(...)}`. bildeSrc gir en full cdn.sanity.io-
 * adresse for Sanity-bilder, så resultatet ble «https://brebygg.nohttps://cdn…»
 * og delinger fikk ikke bilde.
 */
export function delingsbildeUrl(b: Bilde, siteUrl: string): string {
  if (erSanityBilde(b)) {
    return bygger.image(b as unknown as Image).width(1200).height(630).fit("crop").format("jpg").quality(80).url();
  }
  return b.src.startsWith("http") ? b.src : `${siteUrl.replace(/\/$/, "")}${b.src}`;
}
