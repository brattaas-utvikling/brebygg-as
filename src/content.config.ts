// src/content.config.ts
// Astro Content Collections — Zod-skjemaer for type-trygg innholdshåndtering.
// Prosjekter kan komme fra lokale MD-filer eller Sanity (via loader).

import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import { BRUKER_SANITY } from "@lib/sanity/client";
import { prosjekterLoader, tjenesterLoader } from "@lib/sanity/loaders";

// --------------------------------------------------------------------------
// Bilde — godtar begge kilder
//
// Fra markdown: { src, alt, width?, height? }
// Fra Sanity:   { _type: "image", asset: { url, metadata: { dimensions, lqip } }, alt }
//
// Én union i stedet for to skjemaer og to komponentgrener. `erSanityBilde()`
// nedenfor lar komponenter skille når de faktisk trenger det.
// --------------------------------------------------------------------------

const lokaltBilde = z.object({
  src:     z.string(),
  alt:     z.string(),
  width:   z.number().optional(),
  height:  z.number().optional(),
  caption: z.string().optional(),
});

const sanityBilde = z.object({
  _type: z.literal("image").optional(),
  alt:   z.string(),
  bildetekst: z.string().optional(),
  asset: z.object({
    _id: z.string().optional(),
    url: z.string().optional(),
    metadata: z.object({
      dimensions: z.object({ width: z.number(), height: z.number(), aspectRatio: z.number().optional() }).optional(),
      lqip:       z.string().optional(),
    }).optional(),
  }).optional(),
});

const bildeSkjema = z.union([sanityBilde, lokaltBilde]);

export type Bilde = z.infer<typeof bildeSkjema>;

/** True når bildet kommer fra Sanity og skal gjennom SanityBilde.astro. */
export function erSanityBilde(b: Bilde): b is z.infer<typeof sanityBilde> {
  return "asset" in b && b.asset !== undefined;
}

/**
 * URL til bildet. Fungerer for begge kilder.
 *
 * Brukes der vi trenger en enkel streng og ikke et <img>: OG-tagger, preload
 * og CSS-bakgrunner. Til visning skal <Bilde> brukes, ikke denne.
 */
export function bildeSrc(b: Bilde): string {
  return erSanityBilde(b) ? (b.asset?.url ?? "") : b.src;
}

/** Bildetekst. Feltet heter «caption» i markdown og «bildetekst» i Sanity. */
export function bildeTekst(b: Bilde): string | undefined {
  return erSanityBilde(b) ? b.bildetekst : b.caption;
}

// --------------------------------------------------------------------------
// Prosjekt-skjema
// --------------------------------------------------------------------------

const prosjektSkjema = z.object({
  // Grunnleggende info
  title:       z.string().min(3).max(80),
  description: z.string().min(30).max(200),
  location:    z.string(), // f.eks. "Tønsberg" eller "Sandefjord"

  // Kategorisering
  kategori: z.enum([
    "nybygg",
    "rehabilitering",
    "naeringsbygg",
  ]),

  status: z.enum([
    "ferdig",
    "pagaende",
  ]).default("ferdig"),

  // Tidslinje
  aar:         z.number().int().min(2007).max(2030),
  varighet:    z.string().optional(), // f.eks. "12 måneder"

  // Bilder — alltid egenproduserte
  heroImage: bildeSkjema,

  // Galleri (valgfritt)
  galleri: z.array(bildeSkjema).optional().default([]),

  // Casestudie-detaljer
  utfordring: z.string().optional(), // Hva var krevende?
  losning:    z.string().optional(), // Hva ble gjort?
  resultat:   z.string().optional(), // Konkret utfall

  // Nøkkeltall (valgfritt)
  nokkeltall: z.array(
    z.object({
      label: z.string(),
      verdi: z.string(),
    })
  ).optional().default([]),

  // Klient (anonym eller med navn hvis tillatt)
  klient: z.string().optional(),

  // SEO
  seoTitle:       z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),

  // Fremhevet på forsiden
  fremhevet: z.boolean().default(false),

  // Sortering
  sortOrder: z.number().optional(),
});

export type Prosjekt = z.infer<typeof prosjektSkjema>;

// --------------------------------------------------------------------------
// Tjeneste-skjema
//
// Speiler `tjeneste`-dokumentet som kommer i Sanity (fase 5), slik at
// migreringsskriptet blir en ren feltmapping og ikke en omskriving.
//
// Erstatter TJENESTER-konstanten i site.ts, som bare hadde tittel, beskrivelse
// og en slug som pekte på en side som ikke fantes.
// --------------------------------------------------------------------------

const tjenesteSkjema = z.object({
  title:       z.string().min(3).max(80),
  /** Kort variant til bento-grid og meny. */
  kortTittel:  z.string().max(40).optional(),
  description: z.string().min(30).max(200),
  /** Første avsnitt på siden. Slår fast hva vi gjør, for hvem og hvor. */
  ingress:     z.string().min(60),

  heroImage: bildeSkjema,

  /** Styrer bento-cellens størrelse på forsiden. */
  bentoStorrelse: z.enum(["large", "small", "third"]).default("small"),

  /** Hva som inngår. Konkret, ikke verdiløfter. */
  inkludert: z.array(z.string()).min(3),

  /** Prosessen, steg for steg. */
  prosess: z.array(z.object({
    tittel: z.string(),
    tekst:  z.string(),
  })).min(3),

  /** Tjenestespesifikk FAQ. Går inn i FAQPage-schema for denne siden alene. */
  faq: z.array(z.object({
    sporsmaal: z.string(),
    svar:      z.string(),
  })).default([]),

  /** Kobler tjenesten til prosjekter. Sluggene valideres mot collection ved bygg. */
  relaterteProsjekter: z.array(z.string()).default([]),

  /** Prosjektkategorien tjenesten svarer til. Brukes til «se alle»-lenken. */
  kategori: z.enum(["nybygg", "rehabilitering", "naeringsbygg"]),

  seoTitle:       z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),

  sortOrder: z.number().default(0),
});

export type Tjeneste = z.infer<typeof tjenesteSkjema>;

// --------------------------------------------------------------------------
// Collections
// --------------------------------------------------------------------------

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

export const KATEGORIER = [
  { id: "alle",          label: "Alle prosjekter" },
  { id: "nybygg",        label: "Nybygg" },
  { id: "rehabilitering", label: "Rehabilitering" },
  { id: "naeringsbygg",  label: "Næringsbygg" },
] as const;

export type KategoriId = (typeof KATEGORIER)[number]["id"];

/** Visningsnavn per kategori. Ett sted — v1 hadde denne duplisert i tre filer. */
export const KATEGORI_LABEL: Record<Prosjekt["kategori"], string> = {
  nybygg:         "Nybygg",
  rehabilitering: "Rehabilitering",
  naeringsbygg:   "Næringsbygg",
};

export const STATUS_LABEL: Record<Prosjekt["status"], string> = {
  ferdig:   "Ferdigstilt",
  pagaende: "Pågående",
};
