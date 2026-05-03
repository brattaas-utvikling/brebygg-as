// src/content/config.ts
// Astro Content Collections — Zod-skjemaer for type-trygg innholdshåndtering.
// Prosjekter kan komme fra lokale MD-filer eller Sanity (via loader).

import { defineCollection, z } from "astro:content";

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
// Collections
// --------------------------------------------------------------------------

const prosjekter = defineCollection({
  type:   "content",
  schema: prosjektSkjema,
});

export const collections = {
  prosjekter,
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
