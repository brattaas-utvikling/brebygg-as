// sanity/lib/tema.ts
// Temavalgene klienten får i Studio.
//
// Verdiene er nøyaktig de samme som sek--*-klassene i globals.css. Klienten
// velger fra en liste og kan aldri sette farger fritt — dermed kan ingen
// ulovlig kombinasjon av bakgrunn og tekstfarge oppstå. Alle fem er verifisert
// mot WCAG AA i fase 3.

export const TEMAER = [
  { title: "Lys (standard)",  value: "lys"     },
  { title: "Hvit",            value: "hvit"    },
  { title: "Lys grå-beige",   value: "seksjon" },
  { title: "Mørk blå",        value: "mork"    },
  { title: "Mørk khaki",      value: "khaki"   },
] as const;

export type Tema = (typeof TEMAER)[number]["value"];

/** Temaer med lys tekst på mørk bakgrunn. Brukes til rytmevalideringen. */
export const MORKE_TEMAER: readonly Tema[] = ["mork", "khaki"];

export const temaFelt = {
  name:        "tema",
  title:       "Bakgrunn",
  type:        "string",
  description: "Bestemmer bakgrunn og tekstfarge. Veksle mellom lyse og mørke seksjoner — to mørke på rad flater ut siden.",
  options:     { list: [...TEMAER], layout: "dropdown" as const },
  initialValue: "lys",
} as const;
