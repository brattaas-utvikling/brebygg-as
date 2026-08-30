// sanity/lib/tema.ts
// Temavalgene klienten får i Studio.
//
// Verdiene er nøyaktig de samme som sek--*-klassene i globals.css. Klienten
// velger fra en liste og kan aldri sette farger fritt — dermed kan ingen
// ulovlig kombinasjon av bakgrunn og tekstfarge oppstå.
//
// TITLENE er oppdatert til dagens palett. De gamle het «Mørk blå» og «Mørk
// khaki» og stammet fra en palett som ikke finnes lenger: «mork» er i dag
// Green Leaf mørknet ett trinn, og «khaki» er en nesten svart varmbrun.
//
// VERDIENE er med vilje IKKE endret. De ligger lagret på hvert publiserte
// dokument i datasettet, og et navnebytte der ville nullstilt bakgrunnen på
// alle eksisterende seksjoner. Verdiene er data, titlene er grensesnitt.

export const TEMAER = [
  { title: "Lys (standard)", value: "lys" }, //     bandicoot-100  #f4f5f4
  { title: "Hvit", value: "hvit" }, //              hvit           #ffffff
  { title: "Lys grå", value: "seksjon" }, //        bandicoot-200  #e8e8e3
  { title: "Green Leaf – mørk", value: "mork" }, // bandicoot-600  #585a4b
  { title: "Mørk brun", value: "khaki" }, //        bandicoot-800  #2b2922
] as const;

export type Tema = (typeof TEMAER)[number]["value"];

/** Temaer med lys tekst på mørk bakgrunn. Brukes til rytmevalideringen. */
export const MORKE_TEMAER: readonly Tema[] = ["mork", "khaki"];

/**
 * Målt kontrast per tema, alle over AA-kravet på 4,5:1 for normal tekst.
 * Tallene er verifisert i nettleser mot dagens palett, ikke arvet.
 *
 *   Lys       brødtekst 8,65  ·  overskrift 13,32  ·  lenke 6,19
 *   Hvit      brødtekst 9,46  ·  lenke 6,76
 *   Lys grå   brødtekst 7,69  ·  lenke 5,50
 *   Grønn     brødtekst 5,02  ·  overskrift 6,74  ·  lenke 4,65
 *   Mørk brun brødtekst 9,42  ·  overskrift 13,91 ·  lenke 9,60
 *
 * Green Leaf i ren form (#81816b, headerfargen) er BEVISST ikke et
 * seksjonstema. Den tåler kun bandicoot-950 som tekst, på 4,90:1 — hvit
 * ligger på 3,97 og rustlenken på 1,70. Et tema uten plass til dempet tekst
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
