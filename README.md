# brebygg.no

Nettsted for **BRE Bygg AS** — totalentreprenør i Vestfold.

Bygget med Astro v5 + React 18 + Tailwind CSS v4. Statisk generert, deployet til Vercel.

---

## Kom i gang

```bash
# Installer avhengigheter
npm install

# Start dev-server (http://localhost:4321)
npm run dev

# Bygg for produksjon
npm run build

# Forhåndsvis prod-bygg lokalt
npm run preview
```

---

## Mappestruktur

```
src/
  pages/            # Astro-sider (.astro)
  layouts/          # BaseLayout, PageLayout
  components/
    layout/         # Header, Footer, Container, Section
    ui/             # Button, Eyebrow, Divider
    sections/       # Hero, StatsRow, TjenesterBento osv.
    seo/            # JsonLd, Breadcrumbs
  content/
    config.ts       # Zod-skjemaer for Content Collections
    prosjekter/     # .md/.mdx filer per prosjekt
  config/
    site.ts         # NAP-data, åpningstider, FAQ — ENESTE kilde for schema-data
    navigation.ts   # Nav-lenker og breadcrumb-logikk
  lib/
    seo/            # meta.ts, jsonld.ts
    utils/          # cn.ts
  styles/
    globals.css     # Design tokens + base-stiler

public/
  robots.txt
  llms.txt
  images/           # Alle bilder (WebP, maks 200 KB)
```

---

## Design-system

Farger er definert som CSS custom properties i `src/styles/globals.css`:

| Token                 | Verdi     | Bruk                          |
|-----------------------|-----------|-------------------------------|
| `--color-primary`     | `#84856E` | CTA-knapper, lenker, aksenter |
| `--color-bg-dark`     | `#2C4251` | Mørke seksjoner, header       |
| `--color-support`     | `#262A10` | Hover-states, mørke detaljer  |
| `--color-text`        | `#2C4251` | Brødtekst (aldri ren svart)   |
| `--color-bg`          | `#F5F3EF` | Standard sidebakgrunn         |

Typografi: **Plus Jakarta Sans** (600–700 for overskrifter, 400 for brødtekst).

---

## Innhold — Prosjekter

Prosjekter kan legges til som Markdown-filer i `src/content/prosjekter/`:

```yaml
---
title: "Prosjekttittel"
description: "Kortbeskrivelse (30–200 tegn)"
location: "Tønsberg"
kategori: "nybygg" # nybygg | rehabilitering | naeringsbygg
status: "ferdig"
aar: 2024
heroImage:
  src: "/images/prosjekter/mitt-prosjekt.webp"
  alt: "Beskrivende alt-tekst"
fremhevet: false
---

Ingress og brødtekst i Markdown.
```

---

## SEO-regler

- Alle meta-titler: maks 60 tegn, primærnøkkelord først
- Meta-beskrivelser: 140–160 tegn, geografi + handling
- JSON-LD injiseres server-side via `set:html` — aldri i browser-JS
- Kanoniske URL-er har alltid trailing slash
- Bilder: alltid egenproduserte, aldri stockfoto

---

## Fyll inn før lansering

1. **Telefonnummer** i `src/config/site.ts` → `NAP.phone`
2. **Org-nummer** i `src/config/site.ts` → `COMPANY.orgNumber`
3. **Google Maps embed-URL** i `src/config/site.ts` → `MAPS.embedUrl`
4. **Hero-bilde** → `public/images/hero-forside.webp` (maks 200 KB, WebP)
5. **OG-bilde** → `public/images/og-default.jpg` (1200×630 px)
6. **Minst 3 prosjekter** i `src/content/prosjekter/`

---

## Ytelsesmål

- Lighthouse mobil: over 85 (mål: over 95)
- CLS: under 0.1
- Hero-bilde preloades i `BaseLayout.astro`
- Fonter lastes med `font-display: swap`
- Alle bilder via `<Image>` fra `astro:assets` → automatisk WebP + srcset
