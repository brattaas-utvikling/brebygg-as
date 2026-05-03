// src/config/site.ts
// BRE Bygg AS — autoritativ kilde for NAP-data, åpningstider og schema-konfig.
// All JSON-LD og meta-data hentes HER — aldri hardkodes på enkeltside.

export const SITE_URL = "https://brebygg.no" as const;

// --------------------------------------------------------------------------
// NAP — Name, Address, Phone
// Må være identisk på alle sider og i LocalBusiness-schema
// --------------------------------------------------------------------------

export const NAP = {
  name:        "BRE Bygg AS",
  phone:       "+47 452 22 385",       // ← Fyll inn korrekt nummer
  phoneDisplay: "452 22 385",          // ← Visningsformat
  email:       "rudi@brebygg.no",
  address: {
    street:     "Nordre Foksrød 21",
    city:       "Sandefjord",
    postalCode: "3241",
    region:     "Vestfold",
    country:    "NO",
    countryFull: "Norge",
  },
  geo: {
    latitude:  59.1354,
    longitude: 10.2161,
  },
} as const;

// --------------------------------------------------------------------------
// Åpningstider
// --------------------------------------------------------------------------

export const OPENING_HOURS = {
  display: "Man–fre: 07:00–16:00",
  schema: [
    {
      "@type": "OpeningHoursSpecification" as const,
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ] as const,
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

// --------------------------------------------------------------------------
// Selskapsfakta
// --------------------------------------------------------------------------

export const COMPANY = {
  foundingYear:       2007,
  projectsCompleted:  120,
  yearsInBusiness:    18,
  employees:          "3",
  orgNumber:          "934 308 824",
  legalType:          "AS",
} as const;

// --------------------------------------------------------------------------
// SEO-standarder
// --------------------------------------------------------------------------

export const SEO_DEFAULTS = {
  title:       "BRE Bygg — Totalentreprenør i Vestfold",
  description: "BRE Bygg bygger i Vestfold. Nybygg, rehabilitering og næringsbygg — med fullt ansvar fra første møte til du får nøklene.",
  ogImage:     `${SITE_URL}/images/brebygg_logo.webp`,
  locale:      "nb_NO",
  twitterCard: "summary_large_image" as const,
} as const;

// --------------------------------------------------------------------------
// Meta per side
// Brukes av BaseLayout.astro — override per side ved behov
// --------------------------------------------------------------------------

export type PageMeta = {
  title:       string;
  description: string;
  canonical:   string;
  ogImage?:    string;
};

export const PAGE_META = {
  home: {
    title:       "BRE Bygg — Totalentreprenør i Vestfold",
    description: "BRE Bygg bygger i Vestfold. Nybygg, rehabilitering og næringsbygg — med fullt ansvar fra første møte til du får nøklene.",
    canonical:   SITE_URL + "/",
  },
  omOss: {
    title:       "Om BRE Bygg — Totalentreprenør i Vestfold siden 2007",
    description: "BRE Bygg har bygget i Vestfold siden 2007. Møt menneskene bak prosjektene — og finn ut hvordan vi jobber.",
    canonical:   SITE_URL + "/om-oss/",
  },
  prosjekter: {
    title:       "Prosjekter — BRE Bygg | Nybygg, Rehabilitering og Næringsbygg i Vestfold",
    description: "Ferdige prosjekter fra BRE Bygg i Vestfold. Vi viser hva vi tok på oss, hva som var krevende og hva vi faktisk leverte.",
    canonical:   SITE_URL + "/prosjekter/",
  },
  kontakt: {
    title:       "Kontakt BRE Bygg — Totalentreprenør Vestfold",
    description: "Ring eller send en e-post. BRE Bygg svarer på henvendelser om byggeprosjekter i Vestfold innen én arbeidsdag.",
    canonical:   SITE_URL + "/kontakt/",
  },
} as const satisfies Record<string, PageMeta>;

// --------------------------------------------------------------------------
// Social / merkevare
// --------------------------------------------------------------------------

export const SOCIAL = {
  facebook: "https://www.facebook.com/p/BRE-Bygg-61573773851023/",
  instagram: "https://www.instagram.com/brebyggas/",
  linkedin: "https://www.linkedin.com/company/bre-bygg-as/"
} as const;

// --------------------------------------------------------------------------
// Google Maps embed-ID
// --------------------------------------------------------------------------

export const MAPS = {
  // Sandefjord: Nordre Foksrød 21
  embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2047.1234567890!2d10.2161!3d59.1354!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sBRE+Bygg+AS!5e0!3m2!1sno!2sno!4v0000000000000",
  // OBS: Erstatt med faktisk embed-URL fra Google Maps
} as const;

// --------------------------------------------------------------------------
// Tjenester (brukt i TjenesterBento og schema)
// --------------------------------------------------------------------------

export type Tjeneste = {
  id:          string;
  title:       string;
  description: string;
  slug:        string;
  size:        "large" | "small" | "third";
};

export const TJENESTER: Tjeneste[] = [
  {
    id:          "nybygg",
    title:       "Nybygg",
    description: "Fra tomtekjøp til overlevering. Vi håndterer prosjektering, koordinering og bygging — enten det er enebolig i Tønsberg eller leilighetsbygg i Sandefjord.",
    slug:        "/tjenester/nybygg/",
    size:        "large",
  },
  {
    id:          "rehabilitering",
    title:       "Rehabilitering",
    description: "Oppgradering av eksisterende bygg uten unødvendig nedetid. Vi er kjent med de utfordringene som dukker opp bak vegger og under gulv.",
    slug:        "/tjenester/rehabilitering/",
    size:        "small",
  },
  {
    id:          "naeringsbygg",
    title:       "Næringsbygg",
    description: "Kontor, lager, industri og kombinasjonsbygg i Vestfold. Budsjett og fremdrift følges opp ukentlig.",
    slug:        "/tjenester/naeringsbygg/",
    size:        "third",
  },
] as const;

// --------------------------------------------------------------------------
// FAQ-data (brukt i FAQPage schema på landingssiden)
// --------------------------------------------------------------------------

export type FaqItem = {
  question: string;
  answer:   string;
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Hva er en totalentreprenør?",
    answer:
      "En totalentreprenør tar fullt ansvar for hele byggeprosessen — prosjektering, koordinering av underentreprenører og ferdigstillelse. Du forholder deg til én aktør, ikke ti.",
  },
  {
    question: "Hvilke kommuner jobber BRE Bygg i?",
    answer:
      "Vi utfører oppdrag i hele Vestfold, med tyngdepunkt i Tønsberg, Sandefjord, Larvik og Horten. Ta kontakt for å høre om vi kan hjelpe i ditt område.",
  },
  {
    question: "Hvordan får jeg et tilbud?",
    answer:
      "Send oss en e-post eller ring direkte. Vi setter opp et møte der vi går gjennom prosjektet ditt og gir deg et konkret tilbud — uten forpliktelser.",
  },
  {
    question: "Tar dere på dere rehabiliteringsprosjekter i eldre bygg?",
    answer:
      "Ja. Vi har erfaring med bygninger fra alle epoker og vet at eldre bygg kan skjule overraskelser. Vi er åpne om risiko i tilbudet.",
  },
  {
    question: "Hvor lang tid tar et nybyggprosjekt?",
    answer:
      "Det varierer med størrelse og kompleksitet. En enebolig tar typisk 10–14 måneder fra spadetak. Vi setter opp en realistisk fremdriftsplan i tilbudet.",
  },
] as const;

// --------------------------------------------------------------------------
// Navigasjon (brukt av Header.astro)
// Se navigation.ts for full konfig
// --------------------------------------------------------------------------

export const COMPANY_FULL_NAME = `${NAP.name}`;
