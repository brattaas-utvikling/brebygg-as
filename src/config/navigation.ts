// src/config/navigation.ts
// Sentralisert navigasjonskonfig.
// Header.astro og Footer.astro henter herfra — aldri hardkod URL-er.

export type NavItem = {
  label:   string;
  href:    string;
  // Om lenken skal åpnes i ny fane
  external?: boolean;
  // Om den skal fremheves som CTA i nav
  cta?: boolean;
};

// --------------------------------------------------------------------------
// Hovednavigasjon (vises i Header)
// --------------------------------------------------------------------------

// Tjenester først: det er der en kunde som søker «rehabilitering kontorbygg
// Vestfold» skal lande, og sidene fantes allerede — de var bare ikke nåbare
// fra menyen, kun via footeren og bento-blokka på forsiden.
export const MAIN_NAV: NavItem[] = [
  { label: "Tjenester",  href: "/tjenester/" },
  { label: "Prosjekter", href: "/prosjekter/" },
  { label: "Om oss",     href: "/om-oss/" },
  { label: "Kontakt",    href: "/kontakt/", cta: true },
] as const;

// --------------------------------------------------------------------------
// Footer-navigasjon (kolonner)
// --------------------------------------------------------------------------

export type FooterNavGroup = {
  heading: string;
  items:   NavItem[];
};

export const FOOTER_NAV: FooterNavGroup[] = [
  {
    heading: "Tjenester",
    items: [
      { label: "Nybygg",         href: "/tjenester/nybygg/" },
      { label: "Rehabilitering", href: "/tjenester/rehabilitering/" },
      { label: "Næringsbygg",    href: "/tjenester/naeringsbygg/" },
    ],
  },
  {
    heading: "Selskapet",
    items: [
      { label: "Om oss",    href: "/om-oss/" },
      { label: "Prosjekter", href: "/prosjekter/" },
      { label: "Kontakt",   href: "/kontakt/" },
    ],
  },
] as const;

// --------------------------------------------------------------------------
// Breadcrumb-hjelpefunksjon
// Brukes av Breadcrumbs.astro
// --------------------------------------------------------------------------

export type BreadcrumbItem = {
  label: string;
  href:  string;
};

/**
 * @param overstyringer Label per segment. Nødvendig for dynamiske ruter, der
 *   segmentet er en slug og ikke et menneskelesbart navn.
 */
export function buildBreadcrumbs(
  path: string,
  overstyringer: Record<string, string> = {},
): BreadcrumbItem[] {
  const segments = path.replace(/^\/|\/$/g, "").split("/");

  const labelMap: Record<string, string> = {
    "om-oss":     "Om oss",
    "prosjekter": "Prosjekter",
    "kontakt":    "Kontakt",
    "tjenester":  "Tjenester",
    "nybygg":     "Nybygg",
    "rehabilitering": "Rehabilitering",
    "naeringsbygg": "Næringsbygg",
  };

  const crumbs: BreadcrumbItem[] = [{ label: "Hjem", href: "/" }];

  let accumulated = "";
  for (const segment of segments) {
    if (!segment) continue;
    accumulated += `/${segment}`;
    crumbs.push({
      label: overstyringer[segment] ?? labelMap[segment] ?? segment,
      href:  accumulated + "/",
    });
  }

  return crumbs;
}
