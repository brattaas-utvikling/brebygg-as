/**
 * scripts/sjekk-sanity.ts
 *
 * Verifiserer Sanity-oppsettet uten å bygge.
 *
 * Bakgrunn: to runder der bygget var grønt lokalt og tomt i produksjon.
 * Forskjellen var perspektivet — lokalt fantes SANITY_API_READ_TOKEN, som
 * satte perspective til "published". Uten token falt klienten tilbake på
 * API-standarden `drafts`, og utkast er ikke lesbare uten token.
 *
 * Skriptet kjører samme spørring med og uten token, så avviket blir synlig
 * med én gang i stedet for etter en deploy.
 *
 * Kjør:  npm run sjekk:sanity
 */

import { createClient } from "@sanity/client";
import { loadEnv } from "vite";

const env = { ...loadEnv("development", process.cwd(), ""), ...process.env };

const projectId = env.PUBLIC_SANITY_PROJECT_ID;
const dataset   = env.PUBLIC_SANITY_DATASET ?? "production";
const token     = env.SANITY_API_READ_TOKEN;

console.log("\nSanity-oppsett\n");
console.log(`  projectId  ${projectId ?? "MANGLER"}`);
console.log(`  dataset    ${dataset}`);
console.log(`  token      ${token ? "satt" : "ikke satt"}`);

if (!projectId) {
  console.error("\nPUBLIC_SANITY_PROJECT_ID mangler i .env.\n");
  process.exit(1);
}

if (projectId === dataset) {
  console.error(
    `\nFEIL: dataset og projectId er like ("${dataset}").\n` +
    `PUBLIC_SANITY_DATASET skal være datasettnavnet, som regel "production".\n`
  );
  process.exit(1);
}

const SPORRING = `{
  "tjenester": count(*[_type == "tjeneste" && defined(slug.current)]),
  "prosjekter": count(*[_type == "prosjekt" && defined(slug.current)]),
  "forside": count(*[_type == "forside"]),
  "innstillinger": count(*[_type == "nettstedInnstillinger"])
}`;

type Tall = Record<string, number>;

async function sporr(navn: string, medToken: boolean) {
  const klient = createClient({
    projectId: projectId!,
    dataset,
    apiVersion: "2026-08-01",
    useCdn: false,
    perspective: "published",
    ...(medToken && token ? { token } : {}),
  });

  try {
    const r = await klient.fetch<Tall>(SPORRING);
    const sum = Object.values(r).reduce((a, b) => a + b, 0);
    console.log(`\n  ${navn}`);
    for (const [k, v] of Object.entries(r)) {
      console.log(`    ${v === 0 ? "TOM " : "OK  "} ${k.padEnd(14)} ${v}`);
    }
    return sum;
  } catch (feil) {
    console.log(`\n  ${navn}`);
    console.log(`    FEIL  ${(feil as Error).message.split("\n")[0]}`);
    return -1;
  }
}

console.log("\nSpør med perspective: published\n" + "─".repeat(46));

const utenToken = await sporr("uten token — slik Vercel spør hvis tokenet mangler", false);
const medToken  = token ? await sporr("med token", true) : null;

console.log("\n" + "─".repeat(46));

let feil = 0;

if (utenToken === 0) {
  console.log(
    "\nDatasettet svarer tomt uten token.\n" +
    "  Enten er datasettet privat, eller så er ingenting publisert.\n" +
    "  Er det privat, MÅ SANITY_API_READ_TOKEN inn i Vercel — ellers\n" +
    "  bygger produksjon et tomt nettsted."
  );
  feil++;
}

// At det kom *noe* tilbake uten token er ikke nok til å si at tokenet er
// overflødig — det holder at ett dokument er lesbart. Konklusjonen kan bare
// trekkes når tallene er like.
const likeTall = medToken !== null && utenToken >= 0 && medToken === utenToken;

if (likeTall) {
  console.log("\nLike tall med og uten token. Nettstedet er ikke avhengig av SANITY_API_READ_TOKEN.");
} else if (medToken !== null && utenToken >= 0) {
  console.log(
    `\nADVARSEL: ulikt svar med og uten token (${medToken} mot ${utenToken}).\n` +
    "  Produksjon ser noe annet enn maskinen din, og nettstedet står og faller\n" +
    "  på at SANITY_API_READ_TOKEN ligger i Vercel.\n" +
    "\n" +
    "  Vanligste årsak er punktum i _id. Sanity leser punktum som en sti-\n" +
    "  separator, og kun rot-stien er lesbar uten token — også på et offentlig\n" +
    "  datasett. Kjør «npm run rett-id-er:torr» for å se om det er tilfellet."
  );
  feil++;
}

console.log("");
process.exit(feil > 0 ? 1 : 0);
