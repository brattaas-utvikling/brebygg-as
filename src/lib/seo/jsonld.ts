// src/lib/seo/jsonld.ts
// Genererer JSON-LD schema markup for alle sidetyper.
// Alle generatorer returnerer rene JS-objekter — serialisering skjer i JsonLd.astro.
// Alle schema-data hentes fra site.ts — aldri hardkodes her.

import {
  SITE_URL,
  NAP,
  OPENING_HOURS,
  AREA_SERVED,
  HOVEDKOMMUNER,
  FAKTA_BEKREFTET,
  SOCIAL,
  MAPS,
  type FaqItem,
} from "@config/site";
import { TEAM } from "@config/om-oss";

// --------------------------------------------------------------------------
// Hjelpefunksjoner
// --------------------------------------------------------------------------

function orgId(): string {
  return `${SITE_URL}/#organization`;
}

function websiteId(): string {
  return `${SITE_URL}/#website`;
}

// --------------------------------------------------------------------------
// LocalBusiness — brukes på ALLE sider som del av @graph
// --------------------------------------------------------------------------

export function buildLocalBusiness() {
  return {
    "@type":       ["LocalBusiness", "GeneralContractor"],
    "@id":         orgId(),
    "name":        NAP.name,
    "url":         SITE_URL,
    "description": `Totalentreprenør i Vestfold. Nybygg, rehabilitering og næringsbygg i ${HOVEDKOMMUNER.join(", ")} og omegn.`,
    "telephone":   NAP.phone,
    "email":       NAP.email,
    "vatID":       `NO${NAP.orgNumber.replace(/\s/g, "")}MVA`,
    "numberOfEmployees": {
      "@type": "QuantitativeValue",
      "value": FAKTA_BEKREFTET.ansatte,
    },
    "address": {
      "@type":           "PostalAddress",
      "streetAddress":   NAP.address.street,
      "postalCode":      NAP.address.postalCode,
      "addressLocality": NAP.address.city,
      "addressRegion":   NAP.address.region,
      "addressCountry":  NAP.address.country,
    },
    "geo": {
      "@type":     "GeoCoordinates",
      "latitude":  NAP.geo.latitude,
      "longitude": NAP.geo.longitude,
    },
    "areaServed": AREA_SERVED.map((navn) => ({ "@type": "City", "name": navn })),
    "openingHoursSpecification": OPENING_HOURS.schema,
    "hasMap":     MAPS.directUrl,
    "sameAs":     [SOCIAL.facebook, SOCIAL.instagram, SOCIAL.linkedin],

    // Kontaktpunkt på organisasjonsnivå. Rollebasert med vilje: en sitering som
    // peker på en persons adresse brekker den dagen personen bytter rolle, og
    // NAP-konsistens er en av de få målbare faktorene i lokalt søk.
    "contactPoint": [
      {
        "@type":             "ContactPoint",
        "contactType":       "customer service",
        "email":             NAP.email,
        "telephone":         NAP.phone,
        "areaServed":        "NO",
        "availableLanguage": "Norwegian",
      },
    ],

    // De navngitte personene ligger som employee. Det er dette som gir uttelling
    // for AEO: «hvem er daglig leder i BRE Bygg» er et spørsmål en språkmodell
    // kan svare på og sitere. Et påstått prosjekttall er det ikke.
    "employee": TEAM.map((m) => ({
      "@type":     "Person",
      "@id":       `${SITE_URL}/om-oss/#${slugifiser(m.navn)}`,
      "name":      m.navn,
      "jobTitle":  m.rolle,
      "worksFor":  { "@id": orgId() },
      ...(m.epost ? { "email": m.epost } : {}),
      ...(m.tlf   ? { "telephone": m.tlf.replace(/\s/g, "") } : {}),
    })),
  };
}

/** Stabil ankerid for Person-noder. Brukes også som id på /om-oss/-kortene. */
export function slugifiser(navn: string): string {
  return navn
    .toLowerCase()
    .replace(/æ/g, "ae").replace(/ø/g, "oe").replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// --------------------------------------------------------------------------
// WebSite — brukes på alle sider
// --------------------------------------------------------------------------

export function buildWebSite() {
  return {
    "@type":  "WebSite",
    "@id":    websiteId(),
    "url":    SITE_URL,
    "name":   NAP.name,
    "inLanguage": "nb-NO",
    "publisher": { "@id": orgId() },
  };
}

// --------------------------------------------------------------------------
// @graph — base for alle sider
// --------------------------------------------------------------------------

/**
 * Setter sammen en JSON-LD-graf.
 *
 * LocalBusiness og WebSite er med på hver eneste side og legges til her, én
 * gang. Før dette sto de gjentatt i alle seks get*Schema-funksjonene — seks
 * steder å glemme å oppdatere når organisasjonsnoden endrer seg.
 *
 * `undefined` filtreres bort, slik at kallsteder kan skrive
 * `faqs.length ? buildFaqPage(faqs) : undefined` uten et if.
 */
export function komponerGraf(
  ...noder: Array<Record<string, unknown> | undefined>
) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      buildLocalBusiness(),
      buildWebSite(),
      ...noder.filter((n): n is Record<string, unknown> => n !== undefined),
    ],
  };
}

// --------------------------------------------------------------------------
// FAQPage — kun landingssiden
// --------------------------------------------------------------------------

export function buildFaqPage(faqs: readonly FaqItem[]) {
  return {
    "@type": "FAQPage",
    "@id":   `${SITE_URL}/#faq`,
    "mainEntity": faqs.map((faq) => ({
      "@type":          "Question",
      "name":           faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text":  faq.answer,
      },
    })),
  };
}

// --------------------------------------------------------------------------
// BreadcrumbList — alle sider unntatt hjem
// --------------------------------------------------------------------------

export type BreadcrumbInput = {
  label: string;
  url:   string;
};

export function buildBreadcrumbList(items: readonly BreadcrumbInput[]) {
  return {
    "@type":           "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type":    "ListItem",
      "position": index + 1,
      "name":     item.label,
      "item":     item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

// --------------------------------------------------------------------------
// AboutPage — Om oss-siden
// --------------------------------------------------------------------------

export function buildAboutPage(canonical: string) {
  return {
    "@type":     "AboutPage",
    "@id":       `${canonical}#webpage`,
    "url":        canonical,
    "name":      "Om BRE Bygg — Totalentreprenør i Vestfold",
    "description": "Tre personer, én kontaktflate. Møt menneskene bak prosjektene i Vestfold.",
    "inLanguage": "nb-NO",
    "isPartOf":  { "@id": websiteId() },
    "about":     { "@id": orgId() },
  };
}

// --------------------------------------------------------------------------
// CollectionPage — Prosjektoversikt
// --------------------------------------------------------------------------

export function buildCollectionPage(canonical: string) {
  return {
    "@type":       "CollectionPage",
    "@id":         `${canonical}#webpage`,
    "url":          canonical,
    "name":        "Prosjekter — BRE Bygg | Vestfold",
    "description": "Ferdige prosjekter fra BRE Bygg i Vestfold.",
    "inLanguage":  "nb-NO",
    "isPartOf":    { "@id": websiteId() },
    "publisher":   { "@id": orgId() },
  };
}

// --------------------------------------------------------------------------
// Article — individuelle prosjektsider ([slug])
// --------------------------------------------------------------------------

export type ArticleInput = {
  title:       string;
  description: string;
  canonical:   string;
  imageUrl:    string;
  datePublished: string; // ISO 8601: "2024-03-15"
  dateModified?: string;
};

export function buildArticle(input: ArticleInput) {
  return {
    "@type":            "Article",
    "@id":              `${input.canonical}#article`,
    "url":               input.canonical,
    "headline":          input.title,
    "description":       input.description,
    "inLanguage":       "nb-NO",
    "isPartOf":         { "@id": websiteId() },
    "author":           { "@id": orgId() },
    "publisher":        { "@id": orgId() },
    "datePublished":    input.datePublished,
    "dateModified":     input.dateModified ?? input.datePublished,
    "image": {
      "@type": "ImageObject",
      "url":    input.imageUrl,
    },
  };
}

// --------------------------------------------------------------------------
// ContactPage — Kontakt-siden
// --------------------------------------------------------------------------

export function buildContactPage(canonical: string) {
  return {
    "@type":      "ContactPage",
    "@id":        `${canonical}#webpage`,
    "url":         canonical,
    "name":       "Kontakt BRE Bygg",
    "description": `Ring eller send e-post til ${NAP.name}. Vi svarer innen én arbeidsdag.`,
    "inLanguage": "nb-NO",
    "isPartOf":   { "@id": websiteId() },
    "about":      { "@id": orgId() },
  };
}

// --------------------------------------------------------------------------
// Komplett schema per sidetype
// Disse funksjonene returnerer ferdig @graph-objekt klart for JSON.stringify
// --------------------------------------------------------------------------

export function getHomeSchema(faqs: readonly FaqItem[]) {
  return komponerGraf(buildFaqPage(faqs));
}

export function getOmOssSchema(canonical: string) {
  return komponerGraf(
    buildAboutPage(canonical),
    buildBreadcrumbList([
      { label: "Hjem",   url: `${SITE_URL}/` },
      { label: "Om oss", url: canonical },
    ]),
  );
}

export function getProsjekterSchema(canonical: string) {
  return komponerGraf(
    buildCollectionPage(canonical),
    buildBreadcrumbList([
      { label: "Hjem",       url: `${SITE_URL}/` },
      { label: "Prosjekter", url: canonical },
    ]),
  );
}

export function getProsjektSlugSchema(article: ArticleInput, projectTitle: string) {
  return komponerGraf(
    buildArticle(article),
    buildBreadcrumbList([
      { label: "Hjem",       url: `${SITE_URL}/` },
      { label: "Prosjekter", url: `${SITE_URL}/prosjekter/` },
      { label: projectTitle, url: article.canonical },
    ]),
  );
}

export function getKontaktSchema(canonical: string) {
  return komponerGraf(
    buildContactPage(canonical),
    buildBreadcrumbList([
      { label: "Hjem",    url: `${SITE_URL}/` },
      { label: "Kontakt", url: canonical },
    ]),
  );
}

// --------------------------------------------------------------------------
// Service — tjenestesider
//
// Kobles til LocalBusiness via provider: { "@id": orgId() }. Uten det leddet
// står Service-noden løsrevet, og Google ser ikke at det er BRE Bygg som
// leverer tjenesten.
// --------------------------------------------------------------------------

type ServiceInput = {
  navn:        string;
  beskrivelse: string;
  canonical:   string;
  kategori:    string;
};

export function buildService(input: ServiceInput) {
  return {
    "@type":       "Service",
    "@id":         `${input.canonical}#service`,
    "name":        input.navn,
    "description": input.beskrivelse,
    "serviceType": input.kategori,
    "provider":    { "@id": orgId() },
    "areaServed":  AREA_SERVED.map((navn) => ({ "@type": "City", "name": navn })),
    "url":         input.canonical,
  };
}

/**
 * Full graf for en tjenesteside.
 *
 * FAQPage emitteres kun når tjenesten faktisk har spørsmål, og de spørsmålene
 * vises på siden. Schema som beskriver innhold brukeren ikke ser, er nettopp
 * det Googles retningslinjer for strukturerte data slår ned på.
 */
export function getTjenesteSchema(
  service: ServiceInput,
  breadcrumbs: readonly BreadcrumbInput[],
  faqs: readonly FaqItem[],
) {
  return komponerGraf(
    buildService(service),
    buildBreadcrumbList(breadcrumbs),
    // FAQPage kun når spørsmålene faktisk vises på siden. Schema som beskriver
    // innhold brukeren ikke ser, er det Googles retningslinjer slår ned på.
    faqs.length > 0 ? buildFaqPage(faqs) : undefined,
  );
}
