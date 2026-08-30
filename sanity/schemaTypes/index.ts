// sanity/schemaTypes/index.ts

import { seo } from "./objekter/seo";
import { bilde } from "./objekter/bilde";
import { cta, nokkeltall, faq, verdi } from "./objekter/smaating";

import { nettstedInnstillinger } from "./singletons/nettstedInnstillinger";
import { forside } from "./singletons/forside";

import { prosjekt } from "./dokumenter/prosjekt";
import { tjeneste } from "./dokumenter/tjeneste";
import { teamMedlem } from "./dokumenter/teamMedlem";

import { alleBlokker } from "./blokker";

export const schemaTypes = [
  // Objekter — gjenbrukes på tvers
  seo, bilde, cta, nokkeltall, faq, verdi,
  // Blokker — forsidens byggeklosser
  ...alleBlokker,
  // Dokumenter
  prosjekt, tjeneste, teamMedlem,
  // Singletons
  nettstedInnstillinger, forside,
];

/** Dokumenttyper det kun skal finnes ett av. Låses i desk-strukturen. */
export const SINGLETONS = ["nettstedInnstillinger", "forside"] as const;
