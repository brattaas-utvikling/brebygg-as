/**
 * scripts/fjern-naeringsbygg.ts
 *
 * Engangsjobb: fjerner «næringsbygg» fra kundens tekster i Sanity.
 *
 * Bakgrunn: BRE Bygg tilbyr foreløpig bare nybygg og rehabilitering, og alt om
 * næringsbygg skal bort fra nettsiden. Kategorien og all tekst i koden er
 * fjernet. Det som står igjen, er skrevet av kunden i Studio. Uten dette
 * skriptet må hvert felt rettes for hånd.
 *
 * Skriptet erstatter bare hele fraser fra listen under, ikke ordet alene. Et
 * blindt søk-og-erstatt på «næringsbygg» ville etterlatt setninger som
 * «boliger, og offentlige bygg». Treff som ikke dekkes av listen, rapporteres
 * og må rettes i Studio.
 *
 * «næringsliv» og «næringskunder» røres ikke. De beskriver hvem kunden er, ikke
 * hva som bygges.
 *
 * Arraystier bygges med _key og ikke indeks, og hver patch har ifRevisionID.
 * Redigerer noen dokumentet mellom lesing og skriving, feiler transaksjonen i
 * stedet for å overskrive endringen.
 *
 * Kjør tørt først:
 *   npm run fjern-naeringsbygg:torr
 *   SANITY_API_WRITE_TOKEN=sk... npm run fjern-naeringsbygg
 *
 * Tokenet må ha rollen Editor. SANITY_API_READ_TOKEN er ikke nok.
 */

import { createClient } from "@sanity/client";
import { loadEnv } from "vite";

const TORRKJOR = process.argv.includes("--torrkjor");

const env = { ...loadEnv("development", process.cwd(), ""), ...process.env };

const projectId = env.PUBLIC_SANITY_PROJECT_ID;
const dataset   = env.PUBLIC_SANITY_DATASET ?? "production";
const token = TORRKJOR
  ? (env.SANITY_API_WRITE_TOKEN ?? env.SANITY_API_READ_TOKEN)
  : env.SANITY_API_WRITE_TOKEN;

if (!projectId) throw new Error("PUBLIC_SANITY_PROJECT_ID mangler i .env.");
if (!token) {
  throw new Error(
    TORRKJOR
      ? "Verken SANITY_API_WRITE_TOKEN eller SANITY_API_READ_TOKEN er tilgjengelig."
      : "SANITY_API_WRITE_TOKEN mangler. Den krever rollen Editor — lesetokenet i\n" +
        ".env er ikke nok. Send den inline:\n" +
        "  SANITY_API_WRITE_TOKEN=sk... npm run fjern-naeringsbygg"
  );
}

const klient = createClient({
  projectId, dataset, token,
  apiVersion: "2026-08-01",
  useCdn: false,
  // raw: utkast må rettes også, ellers kommer teksten tilbake ved neste publisering.
  perspective: "raw",
});

/** Hele fraser, slik de står i datasettet 29.09.2026. */
const ERSTATNINGER: [fra: string, til: string][] = [
  ["Næringsbygg, bolig og offentlige bygg",                    "Boliger og offentlige bygg"],
  ["boliger, næringsbygg og offentlige bygg",                  "boliger og offentlige bygg"],
  ["fra nybygg, rehabilitering og næringsbygg",                "fra både nybygg og rehabilitering"],
  ["av både offentlige bygg, næringsbygg og boligprosjekter",  "av både offentlige bygg og boligprosjekter"],
  ["skoler, næringsbygg og kommunale eiendommer",              "skoler og kommunale eiendommer"],
  ["Rehabilitering av bolig og næringsbygg i",                 "Rehabilitering av boliger og offentlige bygg i"],
];

const ORD = /næringsbygg/i;

type Endring = { sti: string; fra: string; til: string };

const logg = (m: string) => console.log(`${TORRKJOR ? "[tørrkjøring] " : ""}${m}`);

/** Sanity-sti med _key for arrayelementer: seksjoner[_key=="a1"].svar */
function stiSegment(forelder: string, element: unknown, i: number): string {
  const key = (element as { _key?: string } | null)?._key;
  return `${forelder}[${key ? `_key=="${key}"` : i}]`;
}

function finn(v: unknown, sti: string, endringer: Endring[], rest: string[]): void {
  if (typeof v === "string") {
    if (!ORD.test(v)) return;
    let ny = v;
    for (const [fra, til] of ERSTATNINGER) ny = ny.split(fra).join(til);
    if (ny !== v) endringer.push({ sti, fra: v, til: ny });
    if (ORD.test(ny)) rest.push(`${sti}: ${ny.slice(0, 120)}`);
    return;
  }
  if (Array.isArray(v)) {
    v.forEach((x, i) => finn(x, stiSegment(sti, x, i), endringer, rest));
    return;
  }
  if (v && typeof v === "object") {
    for (const [k, x] of Object.entries(v)) {
      if (k.startsWith("_")) continue;
      finn(x, sti ? `${sti}.${k}` : k, endringer, rest);
    }
  }
}

const dokumenter = await klient.fetch<Record<string, unknown>[]>(
  `*[_type in ["forside", "tjeneste", "prosjekt", "teamMedlem", "nettstedInnstillinger"]]`
);

const tx = klient.transaction();
let antall = 0;
const ikkeDekket: string[] = [];

for (const d of dokumenter) {
  const endringer: Endring[] = [];
  const rest: string[] = [];
  finn(d, "", endringer, rest);

  const navn = `${d._type} «${(d.tittel ?? d._id) as string}»${String(d._id).startsWith("drafts.") ? " (utkast)" : ""}`;
  rest.forEach((r) => ikkeDekket.push(`${navn} → ${r}`));
  if (endringer.length === 0) continue;

  logg(`\n${navn}`);
  for (const e of endringer) {
    logg(`  ${e.sti}`);
    logg(`    - ${e.fra.slice(0, 160)}`);
    logg(`    + ${e.til.slice(0, 160)}`);
  }

  const sett = Object.fromEntries(endringer.map((e) => [e.sti, e.til]));
  tx.patch(String(d._id), (p) => p.ifRevisionId(String(d._rev)).set(sett));
  antall += endringer.length;
}

if (ikkeDekket.length > 0) {
  console.log("\nIkke dekket av listen — rett disse i Studio:");
  ikkeDekket.forEach((r) => console.log(`  ${r}`));
}

if (antall === 0) {
  logg("\nIngen endringer. Datasettet er allerede ryddet.");
} else if (TORRKJOR) {
  logg(`\n${antall} felt ville blitt endret. Ingenting ble skrevet.`);
} else {
  await tx.commit();
  logg(`\n${antall} felt endret. Publisering i Sanity utløser ny bygging hvis webhooken er satt opp.`);
}
