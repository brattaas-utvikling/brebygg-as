// src/content/skjema.ts
//
// Zod-skjemaene, skilt fra collection-oppsettet i content.config.ts.
//
// Grunnen til skillet er testbarhet: content.config.ts importerer
// astro:content, som bare finnes inne i Astro. Denne fila importerer kun
// astro/zod, så scripts/test-skjema.ts kan validere GROQ-svar mot skjemaene
// uten å kjøre et helt bygg — og uten nettverk.
//
// Det hadde spart to runder med tomme collections i produksjon.

import { z } from "astro/zod";

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
  width:   z.number().nullish(),
  height:  z.number().nullish(),
  caption: z.string().nullish(),
});

const sanityBilde = z.object({
  // _type er IKKE en literal.
  //
  // Sanity-typen heter «bilde», så Studio skriver _type: "bilde" på hvert
  // bilde kunden laster opp. Migreringsskriptet skrev "image". Migrerte bilder
  // validerte derfor, mens det første bildet kunden lastet opp selv brakk
  // bygget.
  //
  // Det er `asset` som avgjør om bildet kommer fra Sanity — se erSanityBilde().
  // _type sier bare hvilket skjemanavn feltet har, og det kan endres i Studio
  // uten at formen på dataene endres.
  _type: z.string().optional(),
  alt:   z.string(),
  bildetekst: z.string().nullish(),
  asset: z.object({
    _id: z.string().nullish(),
    url: z.string().nullish(),
    metadata: z.object({
      dimensions: z.object({ width: z.number(), height: z.number(), aspectRatio: z.number().nullish() }).optional(),
      lqip:       z.string().nullish(),
    }).optional(),
  }).optional(),
});

const bildeSkjema = z.union([sanityBilde, lokaltBilde]);

/**
 * Rik tekst fra to kilder.
 *
 * Markdown gir en streng. Sanity gir Portable Text — et array av blokker.
 * Union her, og `tilTekst()` under, i stedet for to komponentgrener.
 *
 * GROQ returnerer dessuten `null` og ikke `undefined` for tomme felt, så alt
 * valgfritt må være `.nullish()` og ikke `.optional()`. Uten det feilet
 * parseData på hvert dokument og begge collections ble tomme — uten at bygget
 * stoppet. Fanget av skjematesten, ikke av bygget.
 */
const portableTextBlokk = z.looseObject({
  _type:    z.string(),
  style:    z.string().nullish(),
  children: z.array(z.looseObject({ text: z.string().nullish() })).nullish(),
});

const rikTekst = z.union([z.string(), z.array(portableTextBlokk)]);

export type RikTekst = z.infer<typeof rikTekst>;

/** Flater Portable Text til ren tekst. Strenger går rett gjennom. */
export function tilTekst(v: RikTekst | null | undefined): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  return v
    .map((b) => (b.children ?? []).map((c) => c.text ?? "").join(""))
    .filter(Boolean)
    .join("\n\n");
}

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
export function bildeTekst(b: Bilde): string | null | undefined {
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
  varighet:    z.string().nullish(), // f.eks. "12 måneder"

  // Bilder — alltid egenproduserte
  heroImage: bildeSkjema,

  // Galleri (valgfritt)
  galleri: z.array(bildeSkjema).nullish().default([]),

  // Casestudie-detaljer
  // Alle tre er rik tekst: streng fra markdown, Portable Text fra Sanity.
  //
  // Ved forrige runde traff regexen min bare `utfordring`, fordi `losning` og
  // `resultat` har innrykk for å ligge på linje. Testen fanget det ikke, siden
  // mock-dataene ga de to `null` i stedet for et blokk-array.
  utfordring: rikTekst.nullish(), // Hva var krevende?
  losning:    rikTekst.nullish(), // Hva ble gjort?
  resultat:   rikTekst.nullish(), // Konkret utfall

  // Nøkkeltall (valgfritt)
  nokkeltall: z.array(
    z.object({
      label: z.string(),
      verdi: z.string(),
    })
  ).nullish().default([]),

  // Klient (anonym eller med navn hvis tillatt)
  klient: z.string().nullish(),

  // SEO
  seoTitle:       z.string().max(60).nullish(),
  seoDescription: z.string().max(160).nullish(),

  // Fremhevet på forsiden
  fremhevet: z.boolean().default(false),

  // Sortering
  sortOrder: z.number().nullish(),
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
  kortTittel:  z.string().max(40).nullish(),
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

  seoTitle:       z.string().max(60).nullish(),
  seoDescription: z.string().max(160).nullish(),

  sortOrder: z.number().default(0),
});

export type Tjeneste = z.infer<typeof tjenesteSkjema>;

// --------------------------------------------------------------------------
// Collections
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

// Eksportert for testing: lar oss validere GROQ-svar mot skjemaet uten å
// kjøre et helt Astro-bygg.

export { prosjektSkjema, tjenesteSkjema };
