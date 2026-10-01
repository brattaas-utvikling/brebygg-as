// src/lib/lenke.ts
//
// Lenker kunden legger inn i Studio (knapper i blokker og hero).
//
// En lenke til et annet nettsted åpnes i ny fane, uten at kunden må huke av
// noe: det avgjøres av adressen. Et avkrysningsfelt ville blitt glemt, og
// interne lenker skal aldri åpne ny fane (brukeren mister tilbake-knappen).

import { SITE_URL } from "@config/site";

const egenVert = new URL(SITE_URL).hostname.replace(/^www\./, "");

/** Sant for http(s)-lenker til et annet domene enn nettstedet selv. */
export function erEkstern(url: string | null | undefined): boolean {
  if (!url || !/^https?:\/\//i.test(url)) return false;
  try {
    return new URL(url).hostname.replace(/^www\./, "") !== egenVert;
  } catch {
    return false;
  }
}

/** Attributter til <a>: ny fane og rel for eksterne lenker, ingenting ellers. */
export function lenkeAttr(url: string | null | undefined) {
  return erEkstern(url) ? { target: "_blank", rel: "noopener noreferrer" } : {};
}
