# Fase 1 + 2 — endringslogg

Bygget grønt på Astro 7.2.1 / React 19.2.8 / Node 22.22. `tsc --noEmit` uten feil.

## Målt resultat

| | v1 | v2 | |
|---|---|---|---|
| Forside HTML | 53,0 KB | 40,7 KB | −23 % |
| /om-oss/ | 56,8 KB | 40,1 KB | −29 % |
| /prosjekter/ | 50,4 KB | 29,9 KB | −41 % |
| /kontakt/ | 36,6 KB | 25,8 KB | −30 % |
| Prosjektside | 38,6 KB | 26,0 KB | −33 % |
| Kommentarer i forsidens HTML | 97 stk / 12 938 B / **23,8 %** | 0 | −100 % |
| JS på /prosjekter/ | 210,4 KB (react-dom + øy) | 3,5 KB inline | −98 % |
| globals.css | 47,1 KB | 34,5 KB | −27 % |

## Nye filer

| Fil | Hva |
|---|---|
| `.nvmrc` | `22.12.0`. Astro 7 og `@astrojs/react` 6 krever begge `node >=22.12.0`. Sett også Node 22 i Vercel-prosjektinnstillingene før deploy. |
| `src/content.config.ts` | Erstatter `src/content/config.ts`. Content Layer API med `glob()`-loader, `z` fra `astro/zod`. Eier nå `KATEGORI_LABEL` og `STATUS_LABEL`, som v1 hadde duplisert i tre filer. |
| `src/components/prosjekter/ProsjektGalleri.astro` | Vanilla-erstatning for React-øya. |
| `src/pages/llms.txt.ts` | Genererer `/llms.txt` fra `FAKTA_BEKREFTET`. |

## Slettet

| Fil | Hvorfor |
|---|---|
| `tailwind.config.mjs` | Brukte `require()` i en ESM-fil og ble aldri lastet av Tailwind v4. Ren dødvekt. |
| `src/content/config.ts` | `[LegacyContentConfigError]` på Astro 6+. |
| `src/components/prosjekter/ProsjektGalleri.tsx` | 210 KB JS for å filtrere seks kort. |
| `src/lib/utils/cn.ts` | Kun brukt av React-øya. |
| `public/llms.txt` | Håndskrevet og allerede driftet fra koden. Genereres nå. |

Fjernede avhengigheter: `tailwindcss`, `@tailwindcss/vite`, `@tailwindcss/typography`,
`astro-compress`, `clsx`, `tailwind-merge`, `@sanity/client` (kommer tilbake i fase 5).

## Faktarettinger

| Felt | v1 | v2 |
|---|---|---|
| Gateadresse | Nordre Foks**r**ød 21 | Nordre Fokse**r**ød 21 |
| Geokoordinater | 59.1354 / 10.2161 — Sandefjord sentrum, ~5,5 km feil | 59.1830952 / 10.2120834 |
| E-post i NAP | rudi@brebygg.no | kontakt@brebygg.no |
| Ansatte i `llms.txt` | 15–20 | 3 |
| Prosjekter | «120+» | fjernet |
| År i bransjen | «18» | fjernet |
| Leveringspresisjon | «mer enn åtte av ti» | fjernet |
| Milepæler 2011/2019/2024 | m²- og prosjekttall | fjernet, `HistorieSeksjon` ute av /om-oss/ |
| Sertifiseringer | Mesterbrev, Sentral godkjenning tiltaksklasse 2, lærebedrift | fjernet fra `HmsSeksjon` |
| Kart-embed | oppdiktet `pb=`-token | nøkkelløs `q=`-form + klikk-for-å-laste |
| `robots.txt` | `Disallow: /_astro/` | fjernet |

Erstatningen for stat-radene er `NOKKELTALL` i `site.ts`: **3 faste ansatte · 1 kontaktpunkt ·
4 hovedkommuner**. Alle tre kan etterprøves, og de sier noe konkurrentene ikke sier.

## Verifisert i output

```
JSON-LD forside:  LocalBusiness/GeneralContractor · WebSite · FAQPage
  email:          kontakt@brebygg.no
  adresse:        Nordre Fokserød 21, 3241 Sandefjord
  geo:            59.1830952 / 10.2120834
  numberOfEmployees: 3
  employee[]:     Rudi Trogstad (Daglig leder) · Bjørn Markeng · Emil T. Fevang (Prosjektledere)
  oppdiktede tall: ingen
Filter:           5 knapper, 6 kort, filterlinje hidden uten JS
BaseLayout-duplikat i HTML: borte
```

## Fortsatt åpent

1. **`/tjenester/nybygg/`, `/rehabilitering/`, `/naeringsbygg/` er fortsatt 404.** Lenkene sto i
   footeren allerede i v1, så det er ikke en ny feil — men den er live på hver eneste side. Fase 8.
2. `FAKTA_UBEKREFTET` i `site.ts` — stiftelsesår, prosjekttall og sertifiseringer. Bekreft eller
   slett før lansering.
3. De seks prosjektfilene har fortsatt oppdiktede m², kWh og prosenter i frontmatter, og de vises.
   Erstattes med ekte data i fase 6.
4. Google Maps API-nøkkel → `PUBLIC_MAPS_EMBED_KEY`, ellers står vi på den nøkkelløse formen.
5. `@layer`-restrukturering av `globals.css` (den snudde CSS-rekkefølgen i Astro 6) er bevisst
   **ikke** gjort her. Det er en kaskadeendring jeg ikke kan verifisere visuelt herfra. Fase 3.
6. Fontprovideren kunne ikke nås i sandkassen (`fonts.google.com` blokkert der), så `<Font />` er
   verifisert på konfigurasjonsnivå, ikke i faktisk output. Sjekk at `dist/_astro/fonts/` fylles
   ved første lokale `npm run build`.

## Kjør

```bash
nvm use            # 22.12.0
rm -rf node_modules package-lock.json
npm install
npm run build      # forventet: 11 ruter, inkl. /llms.txt
npx tsc --noEmit
```
