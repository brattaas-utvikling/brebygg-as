// sanity/lib/tema.ts
// Temavalgene klienten får i Studio.
//
// Verdiene er nøyaktig de samme som sek--*-klassene i globals.css. Klienten
// velger fra en liste og kan aldri sette farger fritt — dermed kan ingen
// ulovlig kombinasjon av bakgrunn og tekstfarge oppstå.
//
// TITLENE følger BRE Design Manual v2.2.1: «mork» er Green Leaf dark 1
// (#444431) og «khaki» er Warm dark (#2C2926), samme som footeren.
//
// VERDIENE er med vilje IKKE endret. De ligger lagret på hvert publiserte
// dokument i datasettet, og et navnebytte der ville nullstilt bakgrunnen på
// alle eksisterende seksjoner. Verdiene er data, titlene er grensesnitt.

export const TEMAER = [
  { title: "Lys (standard)", value: "lys" }, //     bandicoot-100  #f4f5f4
  { title: "Hvit", value: "hvit" }, //              hvit           #ffffff
  { title: "Lys grå", value: "seksjon" }, //        bandicoot-200  #e8e8e3
  { title: "Green Leaf mørk", value: "mork" }, //   leaf-d1        #444431
  { title: "Varm mørk", value: "khaki" }, //        warm-dark      #2c2926
] as const;

export type Tema = (typeof TEMAER)[number]["value"];

/** Temaer med lys tekst på mørk bakgrunn. Brukes til rytmevalideringen. */
export const MORKE_TEMAER: readonly Tema[] = ["mork", "khaki"];

/**
 * Målt kontrast per tema (WCAG 2.1), alle over AA-kravet på 4,5:1 for
 * normal tekst. Uthev er tall, ikoner og nummerering.
 *
 *   Lys             brødtekst 8,65 · overskrift 13,23 · lenke 13,23 · uthev 9,08
 *   Hvit            brødtekst 9,46 · overskrift 14,46 · lenke 14,46 · uthev 9,92
 *   Lys grå         brødtekst 7,69 · overskrift 11,76 · lenke 11,76 · uthev 8,07
 *   Green Leaf mørk brødtekst 6,79 · overskrift 9,48  · lenke 5,56  · uthev 5,56
 *   Varm mørk       brødtekst 9,37 · overskrift 13,82 · lenke 8,11  · uthev 8,11
 *
 * Uthev og lenker på mørk bunn er gull-l (#E7BC63), ikke gull. Gull er 4,47
 * på Green Leaf mørk og holder ikke for små etiketter.
 *
 * Lenker på lys bunn er warm-dark med understrek, ikke en egen farge — gull
 * er 2,03:1 der.
 *
 * Green Leaf i ren form (#81816b, headerfargen) er BEVISST ikke et
 * seksjonstema. Den tåler kun bandicoot-950 som tekst, på 4,90:1 — hvit
 * ligger på 3,97 og gull på 1,79. Et tema uten plass til dempet tekst
 * eller lenker ville brutt i det klienten satte inn en ingress med lenke.
 */
export const temaFelt = {
  name: "tema",
  title: "Bakgrunn",
  type: "string",
  description:
    "Bestemmer bakgrunn og tekstfarge. Veksle mellom lyse og mørke seksjoner — to mørke på rad flater ut siden.",
  options: { list: [...TEMAER], layout: "dropdown" as const },
  initialValue: "lys",
} as const;
