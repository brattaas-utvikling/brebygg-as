// src/content.config.ts
// Astro Content Collections — Zod-skjemaer for type-trygg innholdshåndtering.
// Prosjekter kan komme fra lokale MD-filer eller Sanity (via loader).

import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

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
  heroImage: z.object({
    src:  z.string(),
    alt:  z.string(),
    // width og height for CLS-forebygging
    width:  z.number().optional(),
    height: z.number().optional(),
  }),

  // Galleri (valgfritt)
  galleri: z.array(
    z.object({
      src:    z.string(),
      alt:    z.string(),
      caption: z.string().optional(),
    })
  ).optional().default([]),

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

  heroImage: z.object({
    src:    z.string(),
    alt:    z.string(),
    width:  z.number().optional(),
    height: z.number().optional(),
  }),

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

const prosjekter = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/prosjekter" }),
  schema: prosjektSkjema,
});

const tjenester = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/tjenester" }),
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
