// sanity/schemaTypes/blokker/index.ts
// Blokkene klienten kan sette sammen forsiden av.
//
// Hver blokk har et `tema`-felt fra samme liste som sek--*-klassene i
// globals.css. Klienten velger bakgrunn per seksjon og kan ikke lage en
// ulovlig kombinasjon av bakgrunn og tekstfarge — alle fem består WCAG AA.

import { defineType, defineField, defineArrayMember } from "sanity";
import { TEMAER } from "../../lib/tema";

/**
 * Temafeltet.
 *
 * En funksjon og ikke en delt konstant: Sanity muterer feltdefinisjoner
 * internt, så samme objekt gjenbrukt på ni blokker ville koblet dem sammen.
 * `standard` lar enkeltblokker sette en annen utgangsverdi — CTA-banneret er
 * mørkt som default.
 */
const temaFelt = (standard: string = "lys") =>
  defineField({
    name:  "tema",
    title: "Bakgrunn",
    type:  "string",
    description: "Bestemmer bakgrunn og tekstfarge. Veksle mellom lyse og mørke seksjoner — to mørke på rad flater ut siden.",
    options: { list: [...TEMAER], layout: "dropdown" },
    initialValue: standard,
  });

export const statsRad = defineType({
  name: "statsRad", title: "Nøkkeltall-rad", type: "object",
  fields: [
    temaFelt(),
    defineField({
      name: "tall", title: "Tall", type: "array", of: [{ type: "nokkeltall" }],
      description: "Hold deg til tall dere kan dokumentere. «120+ prosjekter» er ikke etterprøvbart, og alle konkurrenter har en variant av det.",
      validation: (r) => r.min(2).max(4),
    }),
  ],
  preview: { select: { tema: "tema" }, prepare: ({ tema }) => ({ title: "Nøkkeltall-rad", subtitle: `Bakgrunn: ${tema ?? "lys"}` }) },
});

export const paagaendeBanner = defineType({
  name: "paagaendeBanner", title: "Pågående prosjekt", type: "object",
  fields: [
    temaFelt(),
    defineField({ name: "prosjekt", title: "Prosjekt", type: "reference", to: [{ type: "prosjekt" }],
      description: "Velg et prosjekt med status «Pågående». Fremdrift og tekst hentes derfra." }),
  ],
  preview: { select: { title: "prosjekt.tittel" }, prepare: ({ title }) => ({ title: "Pågående prosjekt", subtitle: title ?? "Ingen valgt" }) },
});

export const tjenesterBento = defineType({
  name: "tjenesterBento", title: "Tjenester", type: "object",
  fields: [
    temaFelt(),
    defineField({ name: "overskrift", title: "Overskrift",      type: "string", validation: (r) => r.required() }),
    defineField({ name: "ingress",    title: "Ingress",         type: "text", rows: 3 }),
  ],
  preview: { select: { subtitle: "overskrift" }, prepare: ({ subtitle }) => ({ title: "Tjenester", subtitle }) },
});

export const prosjektKarusell = defineType({
  name: "prosjektKarusell", title: "Prosjektkarusell", type: "object",
  fields: [
    temaFelt(),
    defineField({ name: "overskrift", title: "Overskrift",       type: "string", validation: (r) => r.required() }),
    defineField({
      name: "antall", title: "Maks antall", type: "number", initialValue: 8,
      validation: (r) => r.min(3).max(12),
    }),
    defineField({
      name: "kunFremhevede", title: "Kun fremhevede prosjekter", type: "boolean", initialValue: false,
    }),
  ],
  preview: { select: { subtitle: "overskrift" }, prepare: ({ subtitle }) => ({ title: "Prosjektkarusell", subtitle }) },
});

export const omOssTeaser = defineType({
  name: "omOssTeaser", title: "Om oss", type: "object",
  fields: [
    temaFelt(),
    defineField({ name: "overskrift", title: "Overskrift",       type: "string", validation: (r) => r.required() }),
    defineField({ name: "tekst",      title: "Tekst",            type: "text", rows: 5 }),
    defineField({ name: "bilde",      title: "Bilde",            type: "bilde" }),
    defineField({ name: "cta",        title: "Knapp",            type: "cta" }),
  ],
  preview: { select: { subtitle: "overskrift" }, prepare: ({ subtitle }) => ({ title: "Om oss", subtitle }) },
});

export const baerekraft = defineType({
  name: "baerekraft", title: "Bærekraft", type: "object",
  fields: [
    temaFelt(),
    defineField({ name: "overskrift", title: "Overskrift",       type: "string", validation: (r) => r.required() }),
    defineField({ name: "punkter",    title: "Punkter", type: "array", of: [{ type: "nokkeltall" }],
      description: "Konkrete tiltak, ikke intensjoner." }),
  ],
  preview: { select: { subtitle: "overskrift" }, prepare: ({ subtitle }) => ({ title: "Bærekraft", subtitle }) },
});

export const faqBlokk = defineType({
  name: "faqBlokk", title: "Spørsmål og svar", type: "object",
  description: "FAQPage-schema legges kun ut når denne blokken faktisk står på siden.",
  fields: [
    temaFelt(),
    defineField({ name: "overskrift", title: "Overskrift",       type: "string", validation: (r) => r.required() }),
    defineField({ name: "sporsmaal",  title: "Spørsmål", type: "array", of: [{ type: "faq" }],
      validation: (r) => r.min(3).max(10) }),
  ],
  preview: { select: { subtitle: "overskrift" }, prepare: ({ subtitle }) => ({ title: "Spørsmål og svar", subtitle }) },
});

export const ctaBanner = defineType({
  name: "ctaBanner", title: "Oppfordring til handling", type: "object",
  fields: [
    temaFelt("mork"),
    defineField({ name: "overskrift", title: "Overskrift", type: "string", validation: (r) => r.required() }),
    defineField({ name: "tekst",      title: "Undertekst", type: "text", rows: 2 }),
    defineField({ name: "knapper",    title: "Knapper", type: "array", of: [{ type: "cta" }], validation: (r) => r.max(2) }),
  ],
  preview: { select: { subtitle: "overskrift" }, prepare: ({ subtitle }) => ({ title: "Oppfordring", subtitle }) },
});

export const tekstBilde = defineType({
  name: "tekstBilde", title: "Tekst og bilde", type: "object",
  description: "Generisk blokk til innhold som ikke passer i de andre.",
  fields: [
    temaFelt(),
    defineField({ name: "overskrift", title: "Overskrift",       type: "string", validation: (r) => r.required() }),
    defineField({ name: "tekst",      title: "Tekst", type: "array", of: [defineArrayMember({ type: "block" })] }),
    defineField({ name: "bilde",      title: "Bilde", type: "bilde" }),
    defineField({
      name: "layout", title: "Plassering av bilde", type: "string",
      options: { list: [
        { title: "Bilde til venstre", value: "bildeVenstre" },
        { title: "Bilde til høyre",   value: "bildeHoyre"   },
        { title: "Full bredde",       value: "full"         },
      ]},
      initialValue: "bildeHoyre",
    }),
    defineField({ name: "cta", title: "Knapp", type: "cta" }),
  ],
  preview: { select: { subtitle: "overskrift", media: "bilde" }, prepare: ({ subtitle, media }) => ({ title: "Tekst og bilde", subtitle, media }) },
});

export const alleBlokker = [
  statsRad, paagaendeBanner, tjenesterBento, prosjektKarusell,
  omOssTeaser, baerekraft, faqBlokk, ctaBanner, tekstBilde,
];

/** Navnene brukes både i forside-arrayet og i blokk-dispatcheren i Astro. */
export const BLOKK_NAVN = alleBlokker.map((b) => b.name);
