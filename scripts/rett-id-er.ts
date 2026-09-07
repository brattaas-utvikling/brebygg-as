/**
 * scripts/rett-id-er.ts
 *
 * Engangsjobb: fjerner punktum fra _id på de migrerte dokumentene.
 *
 * Bakgrunn: migreringen ga dokumentene id-er som «prosjekt.kontorbygg-larvik-
 * sentrum». Sanity tolker punktum i _id som en sti-separator, og kun rot-stien
 * er lesbar uten token — også på et offentlig datasett. Dokumentene ble derfor
 * usynlige for enhver uautentisert spørring, og nettstedet ble stille avhengig
 * av at SANITY_API_READ_TOKEN lå i Vercel. Ryker tokenet, tømmes siden.
 *
 * Skriptet leser fra Sanity og ikke fra repoet, slik at redigeringer gjort i
 * Studio beholdes. Bilder røres ikke, så ingen assets dupliseres.
 *
 * Alt skjer i én transaksjon: enten går hele omdøpingen gjennom, eller så
 * skjer ingenting.
 *
 * Kjør tørt først:
 *   SANITY_API_WRITE_TOKEN=sk... npm run rett-id-er:torr
 *   SANITY_API_WRITE_TOKEN=sk... npm run rett-id-er
 *
 * Tokenet må ha rollen Editor. SANITY_API_READ_TOKEN er ikke nok.
 */

import { createClient } from "@sanity/client";
import { loadEnv } from "vite";

const TORRKJOR = process.argv.includes("--torrkjor");

const env = { ...loadEnv("development", process.cwd(), ""), ...process.env };

const projectId = env.PUBLIC_SANITY_PROJECT_ID;
const dataset   = env.PUBLIC_SANITY_DATASET ?? "production";
// Tørrkjøring skriver ingenting og greier seg med lesetokenet i .env. En ekte
// kjøring krever skrivetoken — faller vi tilbake på lesetokenet der, oppdages
// det først ved commit(), etter at hele planen er bygget.
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
        "  SANITY_API_WRITE_TOKEN=sk... npm run rett-id-er"
  );
}

const klient = createClient({
  projectId, dataset, token,
  apiVersion: "2026-08-01",
  useCdn: false,
  // raw: vi må se utkast også, ellers etterlater vi dem med gammel id.
  perspective: "raw",
});

const logg = (m: string) => console.log(`${TORRKJOR ? "[tørrkjøring] " : ""}${m}`);

/**
 * Dokumenter Sanity eier selv. De har punktum i id-en med hensikt, og skal
 * ikke røres — «_.groups.administrator» er tilgangsstyring, ikke innhold.
 */
const erSystem = (id: string, type: string) =>
  id.startsWith("_.") || type.startsWith("system.") || type.startsWith("sanity.");

/** Foreldreløst fra da menyen ble tatt ut av Studio. Typen finnes ikke i skjemaet lenger. */
const SLETT_TYPER = new Set(["navigasjon"]);

const nyId = (id: string) => id.replaceAll(".", "-");

// ---------------------------------------------------------------------------
// Kartlegg hva som skal skje
// ---------------------------------------------------------------------------

const alle = await klient.fetch<Record<string, any>[]>(`*[]`);

const innhold = alle.filter((d) => !erSystem(d._id, d._type));

const slettes = innhold.filter((d) => SLETT_TYPER.has(d._type)).map((d) => d._id);

/** Gammel id → ny id. Utkast får samme behandling som dokumentet de tilhører. */
const kart = new Map<string, string>();

for (const d of innhold) {
  if (SLETT_TYPER.has(d._type)) continue;
  if (d._id.startsWith("drafts.") || d._id.startsWith("versions.")) continue;
  if (!d._id.includes(".")) continue;
  kart.set(d._id, nyId(d._id));
}

for (const d of innhold) {
  if (!d._id.startsWith("drafts.")) continue;
  const publisert = d._id.slice("drafts.".length);
  if (kart.has(publisert)) kart.set(d._id, `drafts.${kart.get(publisert)}`);
}

/** Bytter _ref-verdier som peker på et dokument vi døper om. */
function skrivOmRefs(verdi: unknown): unknown {
  if (Array.isArray(verdi)) return verdi.map(skrivOmRefs);
  if (verdi && typeof verdi === "object") {
    const ut: Record<string, unknown> = {};
    for (const [n, v] of Object.entries(verdi as Record<string, unknown>)) {
      ut[n] = n === "_ref" && typeof v === "string" && kart.has(v) ? kart.get(v)! : skrivOmRefs(v);
    }
    return ut;
  }
  return verdi;
}

/** _rev er optimistisk låsing og hører til dokumentet vi forlater, ikke det nye. */
function utenRev(dok: Record<string, any>) {
  const { _rev, ...resten } = dok;
  return resten;
}

const omdopes = innhold
  .filter((d) => kart.has(d._id))
  .map((d) => ({ ...(skrivOmRefs(utenRev(d)) as Record<string, any>), _id: kart.get(d._id)! }));

// Dokumenter som beholder id-en sin, men peker på noe vi flytter.
const peker = innhold
  .filter((d) => !kart.has(d._id) && !slettes.includes(d._id))
  .filter((d) => {
    const som = JSON.stringify(d);
    return [...kart.keys()].some((gammel) => som.includes(`"${gammel}"`));
  })
  .map((d) => skrivOmRefs(utenRev(d)) as Record<string, any>);

// ---------------------------------------------------------------------------
// Vis planen
// ---------------------------------------------------------------------------

console.log(`\nprojectId ${projectId} · dataset ${dataset}\n`);

console.log(`Døper om ${kart.size} dokumenter:`);
for (const [gammel, ny] of kart) console.log(`   ${gammel}\n     → ${ny}`);

console.log(`\nOppdaterer referanser i ${peker.length} dokumenter:`);
for (const d of peker) console.log(`   ${d._id}`);

console.log(`\nSletter ${slettes.length} foreldreløse dokumenter:`);
for (const id of slettes) console.log(`   ${id}`);

if (kart.size === 0 && slettes.length === 0) {
  console.log("\nIngenting å gjøre — alle id-er er allerede rene.\n");
  process.exit(0);
}

if (TORRKJOR) {
  console.log("\nTørrkjøring: ingenting er skrevet. Kjør uten --torrkjor for å utføre.\n");
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Utfør — alt eller ingenting
// ---------------------------------------------------------------------------

const tx = klient.transaction();

// Rekkefølgen betyr noe: de nye dokumentene må finnes før de gamle slettes,
// ellers bryter sterke referanser underveis.
for (const d of omdopes) tx.createOrReplace(d as never);
for (const d of peker) tx.createOrReplace(d as never);
for (const gammel of kart.keys()) tx.delete(gammel);
for (const id of slettes) tx.delete(id);

await tx.commit({ visibility: "sync" });

logg(`ferdig — ${omdopes.length} omdøpt, ${peker.length} referanser oppdatert, ${slettes.length + kart.size} slettet`);
console.log("\nKjør «npm run sjekk:sanity» for å bekrefte at tallene nå er like med og uten token.\n");
