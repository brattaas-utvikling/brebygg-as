# brebygg.no

Nettsted for **BRE Bygg AS** — totalentreprenør i Vestfold.

Bygget med Astro 7 + React 19 + Sanity (innebygd Studio på /studio). Ren CSS med tokens i globals.css. Statisk generert, deployet til Vercel.

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

Fargene følger **BRE Design Manual v2.2.1** (Jotun 8469 Green Leaf), tilpasset en lys nettside. Tokens og roller står i `src/styles/globals.css`, med kontrastmålinger i kommentarene.

| Rolle | Token | Verdi | Bruk |
|---|---|---|---|
| Struktur | `--leaf` | `#81816B` | Header (kun mørk tekst, 4,90:1) |
| Mørk seksjon | `--color-bg-dark` | `#444431` | Tema «Green Leaf mørk», sidehero |
| Mørkeste flate | `--color-bg-dark-2` | `#2C2926` | Footer, tema «Varm mørk», brødtekst på lys bunn |
| Handling | `--color-action` | `#D9A63A` | Primærknapp og aktivt filter, alltid med mørk tekst (6,52:1) |
| Signatur | `--color-signature` | `#B55A2C` | Streken under overskrifter og liten dekor. Aldri knapp eller lenke |
| Utheving | `--color-uthev` | `#444431` / `#E7BC63` | Tall, ikoner og etiketter på lys / mørk bunn |

Rollene får mørk-verdier automatisk inne i mørke flater (se «MØRKE FLATER» i globals.css). Gull brukes aldri som tekst på lys bunn (2,03:1).

Typografi: **Plus Jakarta Sans** (600–700 for overskrifter, 400 for brødtekst).

---

## Redigering i Sanity

All synlig tekst og alle bilder redigeres i Studio (`/studio`):

- **Sider**: Forside, Tjenester, Prosjekter, Om oss, Kontakt. Tomme felt viser standardteksten fra `src/lib/sanity/sider.ts`.
- **Tjenester, Prosjekter, Personer**: innholdet sidene viser.
- **Innstillinger**: navn, adresse, telefon, e-post, åpningstider, områder og SoMe-lenker. Brukes i header, footer, JSON-LD og llms.txt.

Engangsskript (kjør tørt først, skriving krever `SANITY_API_WRITE_TOKEN` med rollen Editor):

```bash
npm run opprett-sider:torr       # oppretter sidedokumentene med dagens tekster
npm run fjern-naeringsbygg:torr  # fjerner «næringsbygg» fra kundens tekster
```

---

## Innhold — Prosjekter

Prosjekter kan legges til som Markdown-filer i `src/content/prosjekter/`:

```yaml
---
title: "Prosjekttittel"
description: "Kortbeskrivelse (30–200 tegn)"
location: "Tønsberg"
kategori: "nybygg" # nybygg | rehabilitering
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
