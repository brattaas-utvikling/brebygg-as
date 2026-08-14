/**
 * scripts/test-skjema.ts
 *
 * Validerer at GROQ-svarene matcher Zod-skjemaene, uten nettverk.
 *
 * Bakgrunn: to runder med tomme collections i produksjon. Første gang fordi
 * GROQ returnerte norske feltnavn mot engelske skjemafelt. Andre gang fordi
 * `losning` og `resultat` fortsatt var `z.string()` mens Sanity sendte
 * Portable Text — og mock-dataene mine ga dem `null`, så testen så det aldri.
 *
 * Derfor to regler her:
 *   1. Hvert felt fylles med den mest krevende verdien kilden kan gi.
 *      Aldri null der Sanity kan sende et objekt.
 *   2. Testen sjekker at ALLE skjemafelt faktisk er dekket av mock-dataene,
 *      og feiler hvis noen mangler. Et felt som ikke testes er et felt som
 *      brekker i produksjon.
 *
 * Kjør:  npm run test:skjema
 */

import { z } from "astro/zod";
import { prosjektSkjema, tjenesteSkjema } from "../src/content/skjema";

// ---------------------------------------------------------------------------
// Byggeklosser
// ---------------------------------------------------------------------------

// _type: "bilde" — det Studio faktisk skriver. Testen brukte "image", som
// migreringen skrev, og fanget derfor ikke at nye opplastinger brakk bygget.
const sanityBilde = {
  _type: "bilde",
  alt: "Nybygg under oppføring i Tønsberg",
  bildetekst: "Fasaden mot sør",
  asset: {
    _id: "image-abc-1600x900-webp",
    url: "https://cdn.sanity.io/images/x/production/abc-1600x900.webp",
    metadata: {
      dimensions: { width: 1600, height: 900, aspectRatio: 1.78 },
      lqip: "data:image/jpeg;base64,xyz",
    },
  },
};

const portableText = [
  {
    _type: "block",
    _key: "b0",
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: "s0", text: "Tomten lå i et etablert villastrøk.", marks: [] }],
  },
];

const lokaltBilde = { src: "/images/prosjekter/tomannsbolig.webp", alt: "Tomannsbolig", width: 1600, height: 900 };

// ---------------------------------------------------------------------------
// Mock-data — hvert felt fylt, ingen snarveier
// ---------------------------------------------------------------------------

const tilfeller = [
  {
    navn: "prosjekt fra Sanity",
    skjema: prosjektSkjema,
    data: {
      title: "Tomannsbolig i Tønsberg",
      description: "Nybygg av tomannsbolig med to separate inngangspartier, garasje og hage.",
      location: "Tønsberg",
      aar: 2023,
      varighet: "13 måneder",
      kategori: "nybygg",
      status: "ferdig",
      klient: "Privat oppdragsgiver",
      fremhevet: true,
      sortOrder: 1,
      nokkeltall: [{ label: "Bruksareal", verdi: "2 × 148 m²" }],
      // Alle tre som Portable Text. Dette var hullet forrige gang.
      utfordring: portableText,
      losning: portableText,
      resultat: portableText,
      heroImage: sanityBilde,
      // Blandet: ett migrert bilde med _type "image", ett opplastet med "bilde".
      galleri: [sanityBilde, { ...sanityBilde, _type: "image" }],
      seoTitle: "Tomannsbolig i Tønsberg — BRE Bygg",
      seoDescription: "Nybygg av tomannsbolig i Tønsberg, levert som totalentreprise.",
    },
  },
  {
    navn: "prosjekt fra Sanity, tomme valgfrie felt",
    skjema: prosjektSkjema,
    data: {
      title: "Kontorbygg Larvik sentrum",
      description: "Nybygg av kontorbygg i Larvik sentrum fordelt på fire etasjer.",
      location: "Larvik",
      aar: 2022,
      kategori: "naeringsbygg",
      status: "ferdig",
      heroImage: sanityBilde,
      // GROQ sender null, ikke undefined, for alt som ikke er fylt ut
      varighet: null,
      klient: null,
      utfordring: null,
      losning: null,
      resultat: null,
      galleri: [],
      nokkeltall: [],
      seoTitle: null,
      seoDescription: null,
      fremhevet: false,
      sortOrder: 0,
    },
  },
  {
    navn: "prosjekt fra markdown",
    skjema: prosjektSkjema,
    data: {
      title: "Tomannsbolig i Tønsberg",
      description: "Nybygg av tomannsbolig med to separate inngangspartier og garasje.",
      location: "Tønsberg",
      aar: 2023,
      kategori: "nybygg",
      status: "ferdig",
      heroImage: lokaltBilde,
      utfordring: "Tomten lå i et etablert villastrøk med strenge krav til byggehøyde.",
      losning: "Arkitekt justerte takvinkel og gesimshøyde innen gjeldende regulering.",
      resultat: "Byggetillatelse uten klage.",
      fremhevet: true,
      sortOrder: 1,
    },
  },
  {
    navn: "tjeneste fra Sanity",
    skjema: tjenesteSkjema,
    data: {
      title: "Nybygg i Vestfold",
      kortTittel: "Nybygg",
      description: "BRE Bygg bygger nytt i Tønsberg, Sandefjord, Larvik og Horten som totalentreprenør.",
      ingress: "BRE Bygg bygger eneboliger, tomannsboliger og mindre leilighetsbygg i Tønsberg, Sandefjord, Larvik og Horten. Vi tar totalentreprisen.",
      kategori: "nybygg",
      bentoStorrelse: "large",
      sortOrder: 1,
      inkludert: ["Gjennomgang av tomt", "Prosjektering", "Søknad om rammetillatelse"],
      prosess: [
        { tittel: "Befaring", tekst: "Vi går på tomta sammen med deg." },
        { tittel: "Prosjektering", tekst: "Tegninger og tekniske fag settes sammen." },
        { tittel: "Bygging", tekst: "Du får ett nummer å ringe." },
      ],
      faq: [{ sporsmaal: "Må jeg ha tomt først?", svar: "Nei." }],
      heroImage: sanityBilde,
      relaterteProsjekter: ["tonsberg-tomannsbolig-nybygg"],
      seoTitle: null,
      seoDescription: null,
    },
  },
  {
    navn: "tjeneste fra markdown",
    skjema: tjenesteSkjema,
    data: {
      title: "Rehabilitering i Vestfold",
      kortTittel: "Rehabilitering",
      description: "Oppgradering av bolig og næringsbygg i Tønsberg, Sandefjord, Larvik og Horten.",
      ingress: "BRE Bygg rehabiliterer boliger og næringsbygg i Vestfold. Eldre bygg skjuler nesten alltid noe, og vi sier hva vi tror vi finner.",
      kategori: "rehabilitering",
      heroImage: lokaltBilde,
      inkludert: ["Tilstandsvurdering", "Skriftlig anslag", "Søknad"],
      prosess: [
        { tittel: "Befaring", tekst: "Vi ser på bygget." },
        { tittel: "Tilbud", tekst: "Fastpris på det synlige." },
        { tittel: "Utførelse", tekst: "Ukentlig oppdatering." },
      ],
    },
  },
] as const;

// ---------------------------------------------------------------------------
// Dekningssjekk — fanger felt mock-dataene har glemt
// ---------------------------------------------------------------------------

function feltInavn(skjema: z.ZodTypeAny): string[] {
  const def = (skjema as unknown as { shape?: Record<string, unknown> }).shape;
  return def ? Object.keys(def) : [];
}

function sjekkDekning(navn: string, skjema: z.ZodTypeAny, tilfeller: readonly Record<string, unknown>[]): string[] {
  const felt = feltInavn(skjema);
  const dekket = new Set(tilfeller.flatMap((t) => Object.keys(t)));
  return felt.filter((f) => !dekket.has(f));
}

// ---------------------------------------------------------------------------

let feil = 0;

console.log("\nValiderer skjemaer\n");

for (const t of tilfeller) {
  const r = t.skjema.safeParse(t.data);
  if (r.success) {
    console.log(`  OK    ${t.navn}`);
  } else {
    feil++;
    console.log(`  FEIL  ${t.navn}`);
    for (const i of r.error.issues) {
      console.log(`          ${i.path.join(".") || "(rot)"}: ${i.message}`);
    }
  }
}

console.log("\nDekning\n");

for (const [navn, skjema] of [["prosjekt", prosjektSkjema], ["tjeneste", tjenesteSkjema]] as const) {
  const relevante = tilfeller.filter((t) => t.skjema === skjema).map((t) => t.data as Record<string, unknown>);
  const mangler = sjekkDekning(navn, skjema, relevante);
  if (mangler.length === 0) {
    console.log(`  OK    ${navn}: alle felt dekket`);
  } else {
    feil++;
    console.log(`  FEIL  ${navn}: felt uten testdata — ${mangler.join(", ")}`);
    console.log(`          Et felt som ikke testes er et felt som brekker i produksjon.`);
  }
}

console.log("");
process.exit(feil > 0 ? 1 : 0);
