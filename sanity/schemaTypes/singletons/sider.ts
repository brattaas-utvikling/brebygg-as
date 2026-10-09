// sanity/schemaTypes/singletons/sider.ts
//
// Én singleton per underside: Tjenester, Prosjekter, Om oss og Kontakt.
//
// Før dette var all tekst og alle bilder på disse sidene hardkodet i .astro-
// filene. Kunden kunne redigere tjenestene og prosjektene, men ikke sidene
// som viser dem.
//
// To prinsipper:
//
// 1. Tomt felt = standardteksten. Koden har en fallback for hvert felt
//    (src/lib/sanity/sider.ts), så siden aldri står uten innhold. Feltene som
//    bærer siden (H1 og ingress) er likevel påkrevde, så Studio sier fra før
//    publisering.
//
// 2. Fast struktur, fri tilleggsdel. Rekkefølgen på de faste delene er gitt,
//    fordi heroen eier <h1> og LCP-bildet. Under dem kan kunden legge til
//    seksjoner fra samme blokkbibliotek som forsiden, med fritt temavalg.

import { defineType, defineField, defineArrayMember } from "sanity";
import { alleBlokker } from "../blokker";
import { rikTekstBlokker } from "../objekter/rikTekst";

const TOM = "Står feltet tomt, vises standardteksten fra koden.";

/** Hero øverst på en underside. `medBilde: false` gir hero uten bilde. */
const heroFelt = ({ medBilde = true, medSitat = false } = {}) =>
  defineField({
    name: "hero", title: "Toppseksjon", type: "object", group: "hero",
    options: { collapsible: false },
    fields: [
      defineField({
        name: "tittel", title: "Overskrift", type: "string",
        description: "Blir sidens <h1>. Én per side.",
        validation: (r) => r.required().max(70),
      }),
      defineField({
        name: "ingress", title: "Ingress", type: "text", rows: 3,
        description: "Én til to setninger. Si hva siden handler om i første setning.",
        validation: (r) => r.required().max(280).warning("Over 280 tegn blir tungt å lese i toppseksjonen."),
      }),
      ...(medBilde
        ? [defineField({
            name: "bilde", title: "Bilde", type: "bilde",
            description: "Stående format fungerer best (4:5). Minst 1200 px høyt.",
          })]
        : []),
      ...(medSitat
        ? [
            defineField({ name: "sitat", title: "Sitat", type: "text", rows: 2, description: "Valgfritt. Kun ordlyd personen selv har godkjent." }),
            defineField({ name: "sitatKilde", title: "Hvem sa det", type: "string", description: "For eksempel «Rudi, BRE Bygg AS»." }),
          ]
        : []),
    ],
  });

/** Tilleggsseksjoner under det faste innholdet. */
const seksjonerFelt = () =>
  defineField({
    name: "seksjoner", title: "Tilleggsseksjoner", type: "array", group: "seksjoner",
    description: "Valgfritt. Vises under det faste innholdet på siden. Dra for å endre rekkefølge, og veksle mellom lys og mørk bakgrunn.",
    of: alleBlokker.map((b) => defineArrayMember({ type: b.name })),
  });

/**
 * Avslutningen nederst på siden, før footeren. Egen fane («Avslutning»), og
 * standardteksten vises i grått i feltet, så kunden ser hva som står der når
 * feltet er tomt. Før lå den i fanen «Innhold» og ble ikke funnet.
 */
const ctaFelt = (standard: { overskrift: string; tekst: string }) =>
  defineField({
    name: "cta", title: "Avslutning", type: "object", group: "avslutning",
    description: "Den mørke boksen nederst på siden. Knappene («Ta kontakt» og telefon) er faste. Tomt felt viser teksten som står i grått.",
    fields: [
      defineField({ name: "overskrift", title: "Overskrift", type: "string", placeholder: standard.overskrift, validation: (r) => r.max(80) }),
      defineField({ name: "tekst", title: "Tekst", type: "text", rows: 2, placeholder: standard.tekst, description: "Telefonnummeret blir automatisk en lenke." }),
    ],
  });

const avslutningsfane = { name: "avslutning", title: "Avslutning" };

const grupper = [
  { name: "hero",      title: "Toppseksjon", default: true },
  { name: "innhold",   title: "Innhold" },
  { name: "seksjoner", title: "Tilleggsseksjoner" },
  { name: "seo",       title: "SEO" },
];

const seoFelt = () => defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" });

// ---------------------------------------------------------------------------

export const tjenesterSide = defineType({
  name: "tjenesterSide", title: "Tjenester (oversiktssiden)", type: "document",
  groups: [...grupper.filter((g) => g.name !== "innhold" && g.name !== "seo"), avslutningsfane, ...grupper.filter((g) => g.name === "seo")],
  fields: [
    heroFelt(),
    ctaFelt({
      overskrift: "Usikker på hvilken av dem du trenger?",
      tekst: "Ring 452 22 385 og fortell hva du skal gjøre. Er vi ikke riktig entreprenør for jobben, sier vi det.",
    }),
    seksjonerFelt(),
    seoFelt(),
  ],
  preview: { prepare: () => ({ title: "Tjenester", subtitle: "/tjenester/" }) },
});

export const prosjekterSide = defineType({
  name: "prosjekterSide", title: "Prosjekter (oversiktssiden)", type: "document",
  groups: grupper.filter((g) => g.name !== "innhold"),
  fields: [
    heroFelt(),
    defineField({
      name: "galleriOverskrift", title: "Overskrift over prosjektlista", type: "string", group: "hero", placeholder: "Alle prosjekter",
      description: `Bør ikke være lik overskriften i toppseksjonen. ${TOM}`,
    }),
    seksjonerFelt(),
    seoFelt(),
  ],
  preview: { prepare: () => ({ title: "Prosjekter", subtitle: "/prosjekter/" }) },
});

export const omOssSide = defineType({
  name: "omOssSide", title: "Om oss", type: "document",
  groups: grupper,
  fields: [
    heroFelt({ medSitat: true }),
    defineField({
      name: "team", title: "Teamet", type: "object", group: "innhold",
      description: `Personene hentes fra «Personer». Her skriver du teksten over dem. ${TOM}`,
      fields: [
        defineField({ name: "overskrift", title: "Overskrift", type: "string" }),
        defineField({ name: "tekst", title: "Tekst", type: "array", of: rikTekstBlokker() }),
      ],
    }),
    defineField({
      name: "verdier", title: "Verdier", type: "object", group: "innhold",
      description: TOM,
      fields: [
        defineField({ name: "overskrift", title: "Overskrift", type: "string" }),
        defineField({ name: "ingress", title: "Ingress", type: "text", rows: 2 }),
        defineField({
          name: "punkter", title: "Verdier", type: "array",
          description: "Fire fungerer best i rutenettet. Nummereringen (01, 02 …) settes automatisk.",
          validation: (r) => r.max(6),
          of: [defineArrayMember({
            // Ikke «verdi»: det navnet er tatt av en global objekttype i smaating.ts.
            type: "object", name: "verdiPunkt",
            fields: [
              defineField({ name: "kategori", title: "Stikkord", type: "string", description: "Ett ord, for eksempel «Ansvar».", validation: (r) => r.required().max(20) }),
              defineField({ name: "tittel", title: "Tittel", type: "string", validation: (r) => r.required() }),
              defineField({ name: "tekst", title: "Tekst", type: "text", rows: 3, validation: (r) => r.required() }),
              defineField({ name: "bilde", title: "Bilde", type: "bilde", validation: (r) => r.required() }),
            ],
            preview: { select: { title: "tittel", subtitle: "kategori", media: "bilde" } },
          })],
        }),
      ],
    }),
    defineField({
      name: "hms", title: "HMS", type: "object", group: "innhold",
      description: `Påstander om godkjenninger og sertifiseringer må kunne dokumenteres. ${TOM}`,
      fields: [
        defineField({ name: "overskrift", title: "Overskrift", type: "string" }),
        defineField({ name: "tekst", title: "Tekst", type: "array", of: rikTekstBlokker() }),
        defineField({ name: "punkter", title: "Tiltak (punktliste)", type: "array", of: [{ type: "string" }], description: "Konkrete tiltak dere faktisk gjennomfører." }),
        defineField({
          name: "bilde", title: "Bilde", type: "bilde",
          description: "Valgfritt. Vises over forespørselsboksen. Bruk et ekte bilde fra deres egne byggeplasser (verneutstyr, vernerunde, oppstartsmøte), ikke et stockfoto. Uten bilde står boksen alene.",
        }),
        defineField({ name: "boksTittel", title: "Boks: overskrift", type: "string", placeholder: "Tomt felt: ingen overskrift i boksen", description: "Valgfri. Står feltet tomt, vises ingen overskrift." }),
        defineField({ name: "boksTekst", title: "Boks: undertekst", type: "string", placeholder: "Tomt felt: ingen undertekst", description: "Valgfri. Står feltet tomt, vises ingen undertekst." }),
        defineField({ name: "boksSporsmaal", title: "Boks: spørsmål", type: "text", rows: 2 }),
        defineField({ name: "boksKnapp", title: "Boks: knappetekst", type: "string", description: "Knappen går til kontaktsiden." }),
      ],
    }),
    seksjonerFelt(),
    seoFelt(),
  ],
  preview: { prepare: () => ({ title: "Om oss", subtitle: "/om-oss/" }) },
});

export const kontaktSide = defineType({
  name: "kontaktSide", title: "Kontakt", type: "document",
  groups: grupper,
  fields: [
    heroFelt(),
    defineField({
      name: "stripe", title: "Kontaktpunktene under toppseksjonen", type: "object", group: "innhold",
      description: "Telefonnummer, e-post og adresse endres under Innstillinger, så de blir like i header, footer og Google. Her skriver du den lille teksten under hver av dem. Tomt felt viser teksten i grått.",
      fields: [
        defineField({ name: "telefon", title: "Under telefon", type: "string", placeholder: "Ring oss direkte", validation: (r) => r.max(60) }),
        defineField({ name: "epost", title: "Under e-post", type: "string", placeholder: "Svar innen én arbeidsdag", validation: (r) => r.max(60) }),
        defineField({ name: "adresse", title: "Under adresse", type: "string", placeholder: "Vestfold, Norge", validation: (r) => r.max(60) }),
      ],
    }),
    defineField({
      name: "some", title: "Sosiale medier", type: "object", group: "innhold",
      description: `Lenkene hentes fra Innstillinger. ${TOM}`,
      fields: [
        defineField({ name: "overskrift", title: "Overskrift", type: "string" }),
        defineField({ name: "ingress", title: "Ingress", type: "text", rows: 2 }),
        defineField({ name: "bilde", title: "Bakgrunnsbilde", type: "bilde" }),
      ],
    }),
    defineField({
      name: "kartOverskrift", title: "Overskrift over kartet", type: "string", group: "innhold", placeholder: "Vi holder til i Sandefjord",
      description: `Adressen under kartet hentes fra Innstillinger. ${TOM}`,
    }),
    defineField({
      name: "steg", title: "Hva skjer etterpå", type: "object", group: "innhold",
      description: TOM,
      fields: [
        defineField({ name: "overskrift", title: "Overskrift", type: "string" }),
        defineField({
          name: "punkter", title: "Steg", type: "array", validation: (r) => r.max(5),
          of: [defineArrayMember({
            type: "object", name: "kontaktSteg",
            fields: [
              defineField({ name: "tittel", title: "Tittel", type: "string", validation: (r) => r.required() }),
              defineField({ name: "tekst", title: "Tekst", type: "text", rows: 2 }),
            ],
            preview: { select: { title: "tittel", subtitle: "tekst" } },
          })],
        }),
      ],
    }),
    seksjonerFelt(),
    seoFelt(),
  ],
  preview: { prepare: () => ({ title: "Kontakt", subtitle: "/kontakt/" }) },
});

/**
 * Bærekraft. Fri sammensetning: toppseksjon og blokker fra biblioteket, så
 * kunden kan bygge siden selv etter hvert som dokumentasjonen foreligger.
 */
export const baerekraftSide = defineType({
  name: "baerekraftSide", title: "Bærekraft", type: "document",
  groups: [...grupper.filter((g) => g.name !== "innhold" && g.name !== "seo"), avslutningsfane, ...grupper.filter((g) => g.name === "seo")],
  fields: [
    heroFelt(),
    ctaFelt({
      overskrift: "Har du et prosjekt i Vestfold?",
      tekst: "Ring eller send en e-post. Vi svarer innen én arbeidsdag.",
    }),
    defineField({
      name: "seksjoner", title: "Seksjoner", type: "array", group: "seksjoner",
      description: "Innholdet på siden. Miljøpåstander må kunne dokumenteres (markedsføringsloven § 7 og Forbrukertilsynets veiledning): skriv konkrete tiltak og tall, ikke «grønnere fremtid». Dra for å endre rekkefølge, og veksle mellom lys og mørk bakgrunn.",
      of: alleBlokker.map((b) => defineArrayMember({ type: b.name })),
    }),
    seoFelt(),
  ],
  preview: { prepare: () => ({ title: "Bærekraft", subtitle: "/baerekraft/" }) },
});

export const sideSingletons = [tjenesterSide, prosjekterSide, omOssSide, baerekraftSide, kontaktSide];
