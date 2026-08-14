// src/content.config.ts
// Astro Content Collections — Zod-skjemaer for type-trygg innholdshåndtering.
// Prosjekter kan komme fra lokale MD-filer eller Sanity (via loader).

import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { BRUKER_SANITY } from "@lib/sanity/client";
import { prosjekterLoader, tjenesterLoader } from "@lib/sanity/loaders";

// --------------------------------------------------------------------------
// Skjemaene bor i src/content/skjema.ts — se kommentaren der.
// Re-eksporteres herfra så importstier i komponentene er uendret.
// --------------------------------------------------------------------------

export {
  bildeSrc, bildeTekst, erSanityBilde, tilTekst,
  KATEGORIER, KATEGORI_LABEL, STATUS_LABEL,
  prosjektSkjema, tjenesteSkjema,
} from "./content/skjema";

export type { Bilde, Prosjekt, Tjeneste, KategoriId, RikTekst } from "./content/skjema";

import { prosjektSkjema, tjenesteSkjema } from "./content/skjema";

// --------------------------------------------------------------------------
// Kildebryter
//
// Er PUBLIC_SANITY_PROJECT_ID satt, hentes innholdet fra Sanity. Er den ikke
// satt, brukes markdown-filene. Begge kilder går gjennom skjemaene over, så
// getCollection() gir identisk typet data uansett.
//
// MIDLERTIDIG. Markdown-grenen og src/content/-mappene skal slettes når
// migreringen er kjørt og verifisert — to permanente kilder til samme innhold
// er en vedlikeholdsfelle, ikke en funksjon. Se MIGRERING.md.
// --------------------------------------------------------------------------

const prosjekter = defineCollection({
  loader: BRUKER_SANITY
    ? prosjekterLoader()
    : glob({ pattern: "**/[^_]*.md", base: "./src/content/prosjekter" }),
  schema: prosjektSkjema,
});

const tjenester = defineCollection({
  loader: BRUKER_SANITY
    ? tjenesterLoader()
    : glob({ pattern: "**/[^_]*.md", base: "./src/content/tjenester" }),
  schema: tjenesteSkjema,
});

export const collections = {
  prosjekter,
  tjenester,
};

// --------------------------------------------------------------------------
// Kategori-hjelpere (brukt i filtreringslogikk på /prosjekter/)
// --------------------------------------------------------------------------
