// src/lib/seo/jsonld.ts
// Genererer JSON-LD schema markup for alle sidetyper.
// Alle generatorer returnerer rene JS-objekter — serialisering skjer i JsonLd.astro.
// Alle schema-data hentes fra site.ts — aldri hardkodes her.

import {
  SITE_URL,
  NAP,
  OPENING_HOURS,
  AREA_SERVED,
  COMPANY,
  type FaqItem,
} from "@config/site";

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
    "@type":       "LocalBusiness",
    "@id":         orgId(),
    "name":        NAP.name,
    "url":         SITE_URL,
    "description": `Totalentreprenør i Vestfold. Nybygg, rehabilitering og næringsbygg i ${AREA_SERVED.slice(0, 4).join(", ")} og omegn.`,
    "telephone":   NAP.phone,
    "email":       NAP.email,
    "foundingDate": String(COMPANY.foundingYear),
    "address": {
      "@type":         "PostalAddress",
      "streetAddress":  NAP.address.street,
      "addressLocality": NAP.address.city,
      "postalCode":      NAP.address.postalCode,
      "addressRegion":   NAP.address.region,
      "addressCountry":  NAP.address.country,
    },
    "geo": {
      "@type":     "GeoCoordinates",
      "latitude":  NAP.geo.latitude,
      "longitude": NAP.geo.longitude,
    },
    "areaServed": AREA_SERVED,
    "openingHoursSpecification": OPENING_HOURS.schema,
    "priceRange": "Kontakt for tilbud",
    "hasMap": `https://maps.google.com/?q=${encodeURIComponent(
      `${NAP.address.street}, ${NAP.address.postalCode} ${NAP.address.city}`
    )}`,
"sameAs": [
  "https://www.facebook.com/p/BRE-Bygg-61573773851023/",
  "https://www.instagram.com/brebyggas/",
  "https://www.linkedin.com/company/bre-bygg-as/"
],
  };
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

export function buildBaseGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      buildLocalBusiness(),
      buildWebSite(),
    ],
  };
}

// --------------------------------------------------------------------------
// FAQPage — kun landingssiden
// --------------------------------------------------------------------------

export function buildFaqPage(faqs: FaqItem[]) {
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

export function buildBreadcrumbList(items: BreadcrumbInput[]) {
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
    "name":      `Om BRE Bygg — Totalentreprenør i Vestfold siden ${COMPANY.foundingYear}`,
    "description": `BRE Bygg har bygget i Vestfold siden ${COMPANY.foundingYear}. Møt menneskene bak prosjektene.`,
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

export function getHomeSchema(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      buildLocalBusiness(),
      buildWebSite(),
      buildFaqPage(faqs),
    ],
  };
}

export function getOmOssSchema(canonical: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      buildLocalBusiness(),
      buildWebSite(),
      buildAboutPage(canonical),
      buildBreadcrumbList([
        { label: "Hjem",    url: `${SITE_URL}/` },
        { label: "Om oss",  url: canonical },
      ]),
    ],
  };
}

export function getProsjekterSchema(canonical: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      buildLocalBusiness(),
      buildWebSite(),
      buildCollectionPage(canonical),
      buildBreadcrumbList([
        { label: "Hjem",       url: `${SITE_URL}/` },
        { label: "Prosjekter", url: canonical },
      ]),
    ],
  };
}

export function getProsjektSlugSchema(article: ArticleInput, projectTitle: string) {
  const prosjekterUrl = `${SITE_URL}/prosjekter/`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      buildLocalBusiness(),
      buildWebSite(),
      buildArticle(article),
      buildBreadcrumbList([
        { label: "Hjem",        url: `${SITE_URL}/` },
        { label: "Prosjekter",  url: prosjekterUrl },
        { label: projectTitle,  url: article.canonical },
      ]),
    ],
  };
}

export function getKontaktSchema(canonical: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      buildLocalBusiness(),
      buildWebSite(),
      buildContactPage(canonical),
      buildBreadcrumbList([
        { label: "Hjem",    url: `${SITE_URL}/` },
        { label: "Kontakt", url: canonical },
      ]),
    ],
  };
}
