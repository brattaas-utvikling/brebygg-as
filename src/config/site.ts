// src/config/site.ts
// BRE Bygg AS — autoritativ kilde for NAP, åpningstider og faktagrunnlag.
// All JSON-LD, llms.txt og synlig kontaktinfo hentes HER. Aldri hardkod på enkeltside.
//
// Verdiene kommer fra «Innstillinger» i Sanity. Verdiene i denne fila er
// fallback for felt som står tomme, og for bygg uten Sanity (markdown-reserven).
//
// Før september 2026 leste ingenting fra Innstillinger: kunden kunne endre
// telefon, adresse og SoMe-lenker i Studio uten at det nådde nettsiden.
//
// Hentes med toppnivå-await, én gang per bygg. Alle som importerer NAP,
// SOCIAL osv. får Sanity-verdiene uten å vite om det. Fila må derfor aldri
// importeres fra nettleserkode (<script> eller øyer) — der finnes ikke
// Sanity-klienten, og det skal den heller ikke.

import { BRUKER_SANITY, sanityKlient } from "@lib/sanity/client";
import { Q_INNSTILLINGER } from "@lib/sanity/queries";

export const SITE_URL = "https://brebygg.no" as const;

type Innstillinger = {
  navn?: string; orgnummer?: string; telefon?: string; telefonVisning?: string; epost?: string;
  adresse?: { gate?: string; postnr?: string; sted?: string; region?: string };
  geo?: { lat?: number; lng?: number };
  aapningstider?: string; omraader?: string[]; hovedkommuner?: string[];
  antallAnsatte?: number;
  facebook?: string; instagram?: string; linkedin?: string;
};

const I: Innstillinger = BRUKER_SANITY
  ? ((await sanityKlient().fetch<Innstillinger | null>(Q_INNSTILLINGER)) ?? {})
  : {};

/** Sanity-verdien, eller fallbacken hvis feltet er tomt. */
function velg<T>(verdi: T | null | undefined, fallback: T): T {
  if (verdi === null || verdi === undefined) return fallback;
  if (typeof verdi === "string" && verdi.trim() === "") return fallback;
  if (Array.isArray(verdi) && verdi.length === 0) return fallback;
  return verdi;
}

// --------------------------------------------------------------------------
// NAP — Name, Address, Phone
// Må være tegn-for-tegn identisk på nettstedet, i schema, i llms.txt og i
// eksterne oppføringer (Google Business, Proff, 1881). NAP-konsistens er en av
// de få rangeringsfaktorene i lokalt søk som faktisk lar seg måle.
// --------------------------------------------------------------------------

const telefon = velg(I.telefon, "+4745222385");

export const NAP = {
  name:         velg(I.navn, "BRE Bygg AS"),
  // Selskapets adresse. Personlige adresser hører hjemme på TEAM i om-oss.ts —
  // de skal aldri inn i LocalBusiness, fordi en sitering som peker på en person
  // brekker den dagen personen bytter rolle.
  email:        velg(I.epost, "kontakt@brebygg.no"),
  phone:        telefon,
  phoneDisplay: velg(I.telefonVisning, "452 22 385"),
  phoneHref:    `tel:${telefon}`,
  address: {
    street:      velg(I.adresse?.gate, "Nordre Fokserød 21"),
    postalCode:  velg(I.adresse?.postnr, "3241"),
    city:        velg(I.adresse?.sted, "Sandefjord"),
    region:      velg(I.adresse?.region, "Vestfold"),
    country:     "NO",
    countryFull: "Norge",
  },
  geo: {
    latitude:  velg(I.geo?.lat, 59.1830952),
    longitude: velg(I.geo?.lng, 10.2120834),
  },
  orgNumber: velg(I.orgnummer, "934 308 824"),
} as const;

/** Full adresse på én linje. Brukt i kartlenker og llms.txt. */
export const ADRESSE_EN_LINJE =
  `${NAP.address.street}, ${NAP.address.postalCode} ${NAP.address.city}`;

// --------------------------------------------------------------------------
// Åpningstider
// --------------------------------------------------------------------------

export const OPENING_HOURS = {
  // Visningsteksten kan endres i Studio. Klokkeslettene under går i JSON-LD
  // og ligger i koden — endres åpningstidene, må begge oppdateres.
  display: velg(I.aapningstider, "Man–fre: 07:00–16:00"),
  schema: [
    {
      "@type": "OpeningHoursSpecification" as const,
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens:  "07:00",
      closes: "16:00",
    },
  ],
} as const;

// --------------------------------------------------------------------------
// Geografisk dekning
// --------------------------------------------------------------------------

export const AREA_SERVED: readonly string[] = velg(I.omraader, [
  "Tønsberg",
  "Sandefjord",
  "Larvik",
  "Skien",
  "Horten",
  "Stokke",
  "Andebu",
  "Vestfold",
  "Telemark",
]);

/** De fire hovedkommunene — brukt der lista skal være kort og konkret. */
export const HOVEDKOMMUNER: readonly string[] = velg(I.hovedkommuner, ["Tønsberg", "Sandefjord", "Larvik", "Skien"]);

// --------------------------------------------------------------------------
// FAKTAGRUNNLAG
//
// Delt i to med vilje. jsonld.ts og llms.txt.ts importerer KUN det bekreftede
// settet. Da er det strukturelt umulig å få en ubekreftet påstand inn i schema
// eller inn i det AI-crawlerne leser som fasit.
// --------------------------------------------------------------------------

/** Bekreftet av BRE Bygg. Trygt i schema, llms.txt og synlig tekst. */
export const FAKTA_BEKREFTET = {
  ansatte:      velg(I.antallAnsatte, 3),
  legalType:    "AS",
  orgNumber:    NAP.orgNumber,
  entrepriseform: "Totalentreprise",
} as const;

/**
 * IKKE bekreftet. Skal ikke brukes i schema, llms.txt eller synlig tekst før
 * hvert enkelt punkt er verifisert med Rudi. Eksportert her slik at det finnes
 * ett sted å hente dem fra når de skal bekreftes eller slettes — ikke fordi de
 * skal brukes.
 *
 * Bekreft eller slett før lansering:
 */
export const FAKTA_UBEKREFTET = {
  stiftetAar: 2024,
  /** «120+» var oppdiktet. Reelt tall ukjent. */
  antallProsjekter: null,
  /** «Mesterbrev», «Sentral godkjenning tiltaksklasse 2», «Godkjent lærebedrift»
   *  — alle tre er lovregulerte påstander. Verifiser i Sentral godkjenning-
   *  registeret hos DiBK før de publiseres. */
  sertifiseringer: null,
} as const;

// --------------------------------------------------------------------------
// SEO-standarder
// --------------------------------------------------------------------------

export const SEO_DEFAULTS = {
  title:       "BRE Bygg — Totalentreprenør i Vestfold",
  description: "BRE Bygg bygger i Vestfold og Telemark. Nybygg og rehabilitering, med fullt ansvar fra første møte til du får nøklene.",
  ogImage:     `${SITE_URL}/images/og-standard.jpg`,
  locale:      "nb_NO",
  twitterCard: "summary_large_image",
} as const;

// --------------------------------------------------------------------------
// Meta per side
//
// Utvidet med pageType og noindex. I v1 manglet begge på PageMeta-typen, mens
// BaseLayout leste dem — resultatet var at og:type="article" aldri kunne settes
// på prosjektsidene, selv om Article-schema var korrekt.
// --------------------------------------------------------------------------

export type PageMeta = {
  title:        string;
  description:  string;
  canonical:    string;
  ogImage?:     string;
  noindex?:     boolean;
  pageType?:    "website" | "article";
};

/** «Tønsberg, Sandefjord, Larvik og Horten» — til løpende tekst i meta-beskrivelser. */
const KOMMUNER_I_TEKST =
  HOVEDKOMMUNER.length > 1
    ? `${HOVEDKOMMUNER.slice(0, -1).join(", ")} og ${HOVEDKOMMUNER.at(-1)}`
    : HOVEDKOMMUNER.join("");

export const PAGE_META = {
  home: {
    title:       "BRE Bygg | Totalentreprenør i Vestfold og Telemark",
    description: `Vi bygger nytt og rehabiliterer bygg i ${KOMMUNER_I_TEKST}. Samme prosjektleder følger deg fra første møte til du får nøklene.`,
    canonical:   `${SITE_URL}/`,
  },
  tjenester: {
    title:       "Nybygg og rehabilitering i Vestfold | BRE Bygg",
    description: `Totalentreprise på nybygg og rehabilitering i ${KOMMUNER_I_TEKST}. Du har én kontrakt og samme prosjektleder hele veien.`,
    canonical:   `${SITE_URL}/tjenester/`,
  },
  omOss: {
    title:       "Om BRE Bygg | Totalentreprenør med kontor i Sandefjord",
    description: "Møt de som leder prosjektene dine. BRE Bygg er et lite firma i Sandefjord, og her står det hvordan vi jobber med risiko og HMS.",
    canonical:   `${SITE_URL}/om-oss/`,
  },
  prosjekter: {
    title:       "Byggeprosjekter i Vestfold | BRE Bygg",
    description: "Skoler, kommunale bygg og uteanlegg vi har levert eller holder på med i Vestfold. For hvert prosjekt står det hva som var krevende, og hvordan vi løste det.",
    canonical:   `${SITE_URL}/prosjekter/`,
  },
  baerekraft: {
    title:       "Bærekraft og miljø | BRE Bygg",
    description: "Her samler vi det BRE Bygg gjør for miljøet i byggeprosjektene. Bærekraftsrapporten vår ligger i Miljøfyrtårn-portalen.",
    canonical:   `${SITE_URL}/baerekraft/`,
  },
  kontakt: {
    title:       "Kontakt BRE Bygg | Totalentreprenør i Sandefjord",
    description: `Ring ${NAP.phoneDisplay} eller send en e-post om byggeprosjektet ditt. Vi svarer innen én arbeidsdag, og kontoret ligger i ${NAP.address.city}.`,
    canonical:   `${SITE_URL}/kontakt/`,
  },
} as const satisfies Record<string, PageMeta>;

// --------------------------------------------------------------------------
// Sosiale profiler — går inn i sameAs
// --------------------------------------------------------------------------

export const SOCIAL = {
  facebook:  velg(I.facebook,  "https://www.facebook.com/p/BRE-Bygg-61573773851023/"),
  instagram: velg(I.instagram, "https://www.instagram.com/brebyggas/"),
  linkedin:  velg(I.linkedin,  "https://www.linkedin.com/company/bre-bygg-as/"),
} as const;

/** Rekkefølge og visningsnavn der lenkene vises: footer og SoMe-blokka. */
export const SOME_KANALER = [
  { id: "linkedin",  navn: "LinkedIn",  url: SOCIAL.linkedin },
  { id: "instagram", navn: "Instagram", url: SOCIAL.instagram },
  { id: "facebook",  navn: "Facebook",  url: SOCIAL.facebook },
] as const;

// --------------------------------------------------------------------------
// Kart
//
// v1 hadde en oppdiktet pb=-streng med koordinater for Sandefjord sentrum.
// pb-tokenet er en intern Google-verdi som ikke kan utledes av en adresse, så
// vi bruker den nøkkelløse q=-formen i stedet. Den er udokumentert, men stabil
// i praksis og krever ingen API-nøkkel.
//
// Når API-nøkkel foreligger: bytt til Embed API og legg nøkkelen i
// PUBLIC_MAPS_EMBED_KEY. Signaturen på begge er identisk for KartSeksjon.
// --------------------------------------------------------------------------

const kartSok = encodeURIComponent(`${ADRESSE_EN_LINJE}, ${NAP.address.countryFull}`);

export const MAPS = {
  /** Iframe-kilde. Lastes først etter at brukeren klikker (se KartSeksjon). */
  embedUrl: `https://www.google.com/maps?q=${kartSok}&hl=no&z=15&output=embed`,
  /** «Åpne i kart»-lenke. */
  directUrl: `https://www.google.com/maps/search/?api=1&query=${kartSok}`,
} as const;

// --------------------------------------------------------------------------
// Tjenester bor i src/content/tjenester/ som en collection, ikke her.
//
// v1 hadde TJENESTER som en konstant i denne filen, med slugger som pekte på
// sider som ikke fantes. Nå er siden og dataene samme kilde: legger klienten
// til en tjeneste, får den automatisk en rute, en plass i bento-griden, en
// linje i llms.txt og en Service-node i schema.
// --------------------------------------------------------------------------

// --------------------------------------------------------------------------
// FAQ — går inn i FAQPage-schema på landingssiden
//
// Merk: FAQPage skal kun emitteres når spørsmålene faktisk vises på siden.
// Fra fase 7 utledes dette av forsidens seksjonsliste i Sanity.
// --------------------------------------------------------------------------

export type FaqItem = {
  question: string;
  answer:   string;
};

export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: "Hva er en totalentreprenør?",
    answer:   "En totalentreprenør tar ansvar for hele byggeprosessen: prosjektering, koordinering av underentreprenører og ferdigstillelse. Du har én kontaktperson gjennom hele prosjektet.",
  },
  {
    question: "Hvilke kommuner jobber BRE Bygg i?",
    answer:   "Vi utfører oppdrag i hele Vestfold, med tyngdepunkt i Tønsberg, Sandefjord, Larvik og Horten. Ta kontakt for å høre om vi kan hjelpe i ditt område.",
  },
  {
    question: "Hvordan får jeg et tilbud?",
    answer:   "Ring eller send en e-post. Vi avtaler et møte, går gjennom prosjektet ditt og gir deg et skriftlig tilbud. Det er uforpliktende.",
  },
  {
    question: "Tar dere på dere rehabilitering av eldre bygg?",
    answer:   "Ja. Eldre bygg kan skjule overraskelser, og vi er åpne om den risikoen allerede i tilbudet.",
  },
  {
    question: "Hvem snakker jeg med underveis i prosjektet?",
    answer:   "Du får én prosjektleder som følger prosjektet fra første møte til overlevering. Vi er tre personer i BRE Bygg, så du slipper å bli sendt videre.",
  },
] as const;

// --------------------------------------------------------------------------
// NOKKELTALL er fjernet på kundens ønske.
//
// Blokken erstattet i sin tid de oppdiktede tallene («120+ prosjekter»,
// «18 år i bransjen»). Kunden vil ikke ha en tallrad i det hele tatt, så både
// heroen på forsiden og /om-oss/ står nå uten.
//
// Trenger dere den tilbake senere: statsRad-blokken i Sanity gjør det samme,
// og lar klienten skrive tallene selv.
// --------------------------------------------------------------------------

