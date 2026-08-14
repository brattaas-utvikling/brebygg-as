// src/config/site.ts
// BRE Bygg AS — autoritativ kilde for NAP, åpningstider og faktagrunnlag.
// All JSON-LD, llms.txt og synlig kontaktinfo hentes HER. Aldri hardkod på enkeltside.
//
// MIDLERTIDIG: denne filen er kilden fram til fase 6, der innholdet migreres til
// Sanity (`nettstedInnstillinger`). Strukturen speiler skjemaet med vilje, slik at
// migreringsskriptet blir en ren feltmapping.

export const SITE_URL = "https://brebygg.no" as const;

// --------------------------------------------------------------------------
// NAP — Name, Address, Phone
// Må være tegn-for-tegn identisk på nettstedet, i schema, i llms.txt og i
// eksterne oppføringer (Google Business, Proff, 1881). NAP-konsistens er en av
// de få rangeringsfaktorene i lokalt søk som faktisk lar seg måle.
// --------------------------------------------------------------------------

export const NAP = {
  name:         "BRE Bygg AS",
  // Selskapets adresse. Personlige adresser hører hjemme på TEAM i om-oss.ts —
  // de skal aldri inn i LocalBusiness, fordi en sitering som peker på en person
  // brekker den dagen personen bytter rolle.
  email:        "kontakt@brebygg.no",
  phone:        "+4745222385",     // E.164 — formatet schema.org forventer
  phoneDisplay: "452 22 385",      // visningsformat
  phoneHref:    "tel:+4745222385",
  address: {
    street:      "Nordre Fokserød 21",   // rettet: sto «Foksrød» i v1
    postalCode:  "3241",
    city:        "Sandefjord",
    region:      "Vestfold",
    country:     "NO",
    countryFull: "Norge",
  },
  geo: {
    // Verifisert mot Nordre Fokserød 21. v1 hadde 59.1354 / 10.2161, som peker
    // på Sandefjord sentrum — omtrent 5,5 km unna.
    latitude:  59.1830952,
    longitude: 10.2120834,
  },
  orgNumber: "934 308 824",
} as const;

/** Full adresse på én linje. Brukt i kartlenker og llms.txt. */
export const ADRESSE_EN_LINJE =
  `${NAP.address.street}, ${NAP.address.postalCode} ${NAP.address.city}`;

// --------------------------------------------------------------------------
// Åpningstider
// --------------------------------------------------------------------------

export const OPENING_HOURS = {
  display: "Man–fre: 07:00–16:00",
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

export const AREA_SERVED = [
  "Tønsberg",
  "Sandefjord",
  "Larvik",
  "Horten",
  "Stokke",
  "Andebu",
  "Vestfold",
] as const;

/** De fire hovedkommunene — brukt der lista skal være kort og konkret. */
export const HOVEDKOMMUNER = ["Tønsberg", "Sandefjord", "Larvik", "Horten"] as const;

// --------------------------------------------------------------------------
// FAKTAGRUNNLAG
//
// Delt i to med vilje. jsonld.ts og llms.txt.ts importerer KUN det bekreftede
// settet. Da er det strukturelt umulig å få en ubekreftet påstand inn i schema
// eller inn i det AI-crawlerne leser som fasit.
//
// Bakgrunn: v1 inneholdt «120+ prosjekter», «18 år i drift», «15–20 ansatte» og
// «levert innen avtalt tid i mer enn åtte av ti tilfeller». Ingen av tallene har
// dekning. Falske tall i LocalBusiness treffer nøyaktig det Googles spampolicy
// er laget for, og «Sentral godkjenning tiltaksklasse 2» er dessuten en
// lovregulert påstand.
// --------------------------------------------------------------------------

/** Bekreftet av BRE Bygg. Trygt i schema, llms.txt og synlig tekst. */
export const FAKTA_BEKREFTET = {
  ansatte:      3,
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
  /** Oppgitt som 2007 i v1. Kryssjekk mot Brønnøysund før bruk. */
  stiftetAar: 2007,
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
  description: "BRE Bygg bygger i Vestfold. Nybygg, rehabilitering og næringsbygg — med fullt ansvar fra første møte til du får nøklene.",
  ogImage:     `${SITE_URL}/images/brebygg_logo.webp`,
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

export const PAGE_META = {
  home: {
    title:       "BRE Bygg — Totalentreprenør i Vestfold",
    description: "BRE Bygg bygger i Vestfold. Nybygg, rehabilitering og næringsbygg — med fullt ansvar fra første møte til du får nøklene.",
    canonical:   `${SITE_URL}/`,
  },
  omOss: {
    title:       "Om BRE Bygg — Totalentreprenør i Vestfold",
    description: "Tre personer, én kontaktflate. Møt menneskene bak prosjektene i Tønsberg, Sandefjord, Larvik og Horten.",
    canonical:   `${SITE_URL}/om-oss/`,
  },
  prosjekter: {
    title:       "Prosjekter — BRE Bygg | Nybygg og næringsbygg i Vestfold",
    description: "Ferdige prosjekter fra BRE Bygg i Vestfold. Vi viser hva vi tok på oss, hva som var krevende og hva vi faktisk leverte.",
    canonical:   `${SITE_URL}/prosjekter/`,
  },
  kontakt: {
    title:       "Kontakt BRE Bygg — Totalentreprenør Vestfold",
    description: "Ring eller send en e-post. BRE Bygg svarer på henvendelser om byggeprosjekter i Vestfold innen én arbeidsdag.",
    canonical:   `${SITE_URL}/kontakt/`,
  },
} as const satisfies Record<string, PageMeta>;

// --------------------------------------------------------------------------
// Sosiale profiler — går inn i sameAs
// --------------------------------------------------------------------------

export const SOCIAL = {
  facebook:  "https://www.facebook.com/p/BRE-Bygg-61573773851023/",
  instagram: "https://www.instagram.com/brebyggas/",
  linkedin:  "https://www.linkedin.com/company/bre-bygg-as/",
} as const;

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
    answer:   "En totalentreprenør tar ansvar for hele byggeprosessen — prosjektering, koordinering av underentreprenører og ferdigstillelse. Du forholder deg til én aktør, ikke ti.",
  },
  {
    question: "Hvilke kommuner jobber BRE Bygg i?",
    answer:   "Vi utfører oppdrag i hele Vestfold, med tyngdepunkt i Tønsberg, Sandefjord, Larvik og Horten. Ta kontakt for å høre om vi kan hjelpe i ditt område.",
  },
  {
    question: "Hvordan får jeg et tilbud?",
    answer:   "Ring eller send en e-post. Vi setter opp et møte der vi går gjennom prosjektet ditt og gir deg et konkret tilbud — uten forpliktelser.",
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
// heroen på forsiden, /om-oss/ og OmOssTeaser står nå uten.
//
// Trenger dere den tilbake senere: statsRad-blokken i Sanity gjør det samme,
// og lar klienten skrive tallene selv.
// --------------------------------------------------------------------------

