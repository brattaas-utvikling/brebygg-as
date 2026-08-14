// src/lib/sanity/tema.ts
// Speilbildet av sanity/lib/tema.ts på frontend-siden.
//
// Verdiene må være identiske i tre lag: Sanity-dropdownen, denne typen og
// sek--*-klassene i globals.css. Union-typen gjør at TypeScript stopper et
// tema som ikke finnes — legger noen til en sjette verdi i Sanity uten å
// oppdatere CSS, feiler bygget i stedet for å rendre en seksjon uten bakgrunn.

export const TEMA_KLASSE = {
  lys:     "sek--lys",
  hvit:    "sek--hvit",
  seksjon: "sek--seksjon",
  mork:    "sek--mork",
  khaki:   "sek--khaki",
} as const;

export type Tema = keyof typeof TEMA_KLASSE;

export const MORKE_TEMAER: readonly Tema[] = ["mork", "khaki"];

export function temaKlasse(tema: string | undefined | null): string {
  return TEMA_KLASSE[(tema ?? "lys") as Tema] ?? TEMA_KLASSE.lys;
}

/** True når temaet har lys tekst. Styrer knappevariant og eyebrow-farge. */
export function erMorkt(tema: string | undefined | null): boolean {
  return MORKE_TEMAER.includes((tema ?? "lys") as Tema);
}
