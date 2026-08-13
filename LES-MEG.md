# Fase 8 + 9

Bygget grønt. **`astro check`: 0 feil, 0 advarsler.** 15 ruter (var 11).

## Pakk ut

```bash
cd brebygg-as
git checkout -b fase-8-9
unzip -o ~/Downloads/brebygg-fase-8-9.zip -d /tmp/bre89
cp -R /tmp/bre89/fase-8-9/. .
rm -f src/components/sections/HistorieSeksjon.astro \
      src/components/sections/StatsRow.astro
rm -rf /tmp/bre89
npm install          # legger til @astrojs/check
npm run build
npm run check        # ny — se under
```

---

## Det viktigste funnet: `tsc --noEmit` sjekket aldri `.astro`-filene

`tsc` leser bare `.ts`. Alle Astro-komponenter var utypesjekket. Da jeg satte
opp `astro check` (via `@astrojs/check`), kom det **sju feil** ut med én gang —
tre av dem var mine fra forrige runde, og ingen av dem stoppet bygget:

| Feil | Hvorfor bygget likevel var grønt |
|---|---|
| `HistorieSeksjon` importerte `MILEPÆLER`, som jeg slettet | Komponenten var kommentert ut av `/om-oss/` |
| `StatsRow` importerte `COMPANY`, som jeg slettet | Kommentert ut av forsiden |
| `ProsjektKarusell`: `entry.id` fantes ikke på typen | En håndlaget `ProsjektEntry`-type skygget for `CollectionEntry` |
| `[slug].astro`: `Prosjekt` ikke importert | Kun brukt i en type-annotasjon, som strippes ved bygg |
| `getHomeSchema(FAQ_ITEMS)`: `readonly` vs mutable | Fungerer i JS, feil i typene |

`npm run check` er nå koblet opp og bør kjøres før hver commit. **Dette burde
vært på plass fra fase 1.**

De to døde komponentene er slettet — begge var bygget på oppdiktede tall.

## Fase 8 — `/tjenester/`

Fire nye ruter. De tre 404-lenkene i footeren er borte.

| Rute | Innhold |
|---|---|
| `/tjenester/` | Oversikt, tre `Service`-noder i schema |
| `/tjenester/nybygg/` | `bentoStorrelse: large` |
| `/tjenester/rehabilitering/` | |
| `/tjenester/naeringsbygg/` | |

Ny `tjenester`-collection i `src/content.config.ts`. Feltene speiler
`tjeneste`-dokumentet som kommer i Sanity, så migreringen blir en feltmapping.

Hver side har hero, «dette inngår», femstegs prosess, relaterte prosjekter,
tjenestespesifikk FAQ og CTA. Innholdet er skrevet mot tone of voice-kravene:
ingen tomme verdiløfter, konkret i hvert avsnitt, ærlig om hva som er usikkert
(grunnforhold, kommunal saksbehandlingstid, hva som skjuler seg i eldre bygg).

### Schema

```
/tjenester/         LocalBusiness · WebSite · Service ×3 · BreadcrumbList
/tjenester/nybygg/  LocalBusiness · WebSite · Service · BreadcrumbList · FAQPage
```

Hver `Service` kobles til `LocalBusiness` via `provider: { "@id": … }`. Uten det
leddet står noden løsrevet og Google ser ikke hvem som leverer tjenesten.

`FAQPage` emitteres kun når tjenesten faktisk har spørsmål **og** de vises på
siden. Schema for usynlig innhold er det Googles retningslinjer slår ned på.

### Byggetidsvalidering

`relaterteProsjekter` valideres mot faktiske prosjektslugger i
`getStaticPaths()`. Feilstaver du en slug, feiler bygget med hvilke som finnes —
i stedet for å vise en tom seksjon i produksjon. Zod kan ikke gjøre dette; den
kjenner ikke de andre collection-ene.

## Fase 9 — kontaktpunkter

`KontaktBar.astro`: sticky bar på mobil med `tel:` og `mailto:`. Vises etter
0,9 skjermhøyder, altså først når heroens egne knapper er ute av bildet — ellers
ville vi bare flyttet klikk mellom to knapper og lært ingenting.

52 px touch-mål, `env(safe-area-inset-bottom)`, `body:has()` gir plass så baren
ikke dekker footeren, og `prefers-reduced-motion` slår av animasjonen.

**Analytics:** én delegert lytter fanger *alle* `tel:`- og `mailto:`-klikk på
nettstedet, ikke bare de i baren. Header, hero, kontaktkort og 404-siden telles
i samme rapport med `kilde` og `side`. Uten det har vi ingen data på hva som
faktisk fører til en henvendelse.

## Ryddet underveis

- **`kategoriLabel` fantes i tre eksemplarer** — `ProsjektKarusell`,
  `[slug].astro` og `content.config.ts`. Nå én: `KATEGORI_LABEL`.
- **`TJENESTER` er ute av `site.ts`.** Tjenester bor i collection-en. Legger
  klienten til én, får den automatisk rute, plass i bento-griden, linje i
  `llms.txt` og en `Service`-node. Bento-en plukket dem før med `TJENESTER[0]!`.
- **`komponerGraf()`** erstatter `buildLocalBusiness(), buildWebSite()` gjentatt
  i seks `get*Schema`-funksjoner.
- **`/404.html` fantes ikke** — `vercel.json` har rutet `/.*` dit hele tiden.
  Ukjente URL-er fikk Vercels standardside uten header, footer eller vei videre.
  Ny `404.astro` med `noindex`, lenker og kontaktknapper.
- **`llms.txt`** har nå en `## Vanlige spørsmål`-seksjon med 17 Q/A-par.
  Q/A er formatet svarmotorer plukker opp lettest.

## Verifisert

```
Ruter:                15 (var 11)
astro check:          0 feil, 0 advarsler
Brutte interne lenker: 0  (skannet alle href i alle 15 sider)
Sitemap:              14 URL-er, 404 ikke med
JS på tjenesteside:   2 460 bytes inline, 0 eksterne
Vekt:                 /tjenester/nybygg/ 30,7 KB · /tjenester/ 23,2 KB
```

## Sjekk selv

- [ ] Footerens tre tjenestelenker gir side, ikke 404
- [ ] `/tjenester/nybygg/` — FAQ åpner og lukker, tastatur fungerer
- [ ] Relaterte prosjekter nederst lenker riktig
- [ ] Mobil: kontaktbaren glir opp etter scroll og dekker ikke footeren
- [ ] `/finnes-ikke/` gir 404-siden med header og footer
- [ ] `curl -s localhost:4321/llms.txt | grep '###' | wc -l` → 17

## Fortsatt åpent

1. Bilder: tjenestesidene bruker eksisterende filer. `nybygg.jpg` er fortsatt
   JPG i en WebP-policy, og `rehabilitering` låner et prosjektbilde.
2. Prosjektdataene er fortsatt oppdiktede. Fase 6.
3. Fase 3 (CSS-kaskaden, hero-kontrast, buet hero) gjenstår — isolert med vilje.
