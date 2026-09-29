/**
 * scripts/opprett-sider.ts
 *
 * Oppretter sidedokumentene (Tjenester, Prosjekter, Om oss, Kontakt) i Sanity
 * med teksten og bildene nettstedet viser i dag.
 *
 * Bakgrunn: sidene hentet tidligere all tekst fra koden. Nettstedet viser
 * fortsatt standardteksten når dokumentet mangler (se src/lib/sanity/sider.ts),
 * men da ser kunden tomme felt i Studio mens siden har innhold. Dette skriptet
 * fyller Studio med det som faktisk vises, så kunden redigerer fra der siden
 * står — ikke fra blanke ark.
 *
 * createIfNotExists: et dokument som allerede finnes, røres ikke. Skriptet kan
 * derfor kjøres igjen uten å overskrive noe kunden har skrevet.
 *
 * Standardtekstene importeres fra sider.ts, ikke kopieres hit. To kopier av
 * samme tekst ville drevet fra hverandre.
 *
 * Kjør tørt først:
 *   npm run opprett-sider:torr
 *   SANITY_API_WRITE_TOKEN=sk... npm run opprett-sider
 *
 * Tokenet må ha rollen Editor. SANITY_API_READ_TOKEN er ikke nok.
 */

import { createClient } from "@sanity/client";
import { loadEnv } from "vite";
import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";

const TORRKJOR = process.argv.includes("--torrkjor");

// Fylles før sider.ts importeres: klienten der leser process.env når den
// kjøres utenfor Astro.
Object.assign(process.env, { ...loadEnv("development", process.cwd(), ""), ...process.env });

const { STANDARDTEKSTER } = await import("../src/lib/sanity/sider");
const { FAKTA_BEKREFTET } = await import("../src/config/site");

const env = process.env;
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
        "  SANITY_API_WRITE_TOKEN=sk... npm run opprett-sider"
  );
}

const klient = createClient({ projectId, dataset, token, apiVersion: "2026-08-01", useCdn: false, perspective: "raw" });

const logg = (m: string) => console.log(`${TORRKJOR ? "[tørrkjøring] " : ""}${m}`);

// ---------------------------------------------------------------------------

const bildeCache = new Map<string, string>();

/** Lokal fil i /public → Sanity-asset. Samme form som Studio skriver. */
async function lastOpp(src: string, alt: string) {
  if (!bildeCache.has(src)) {
    const fil = await readFile(join("public", src.replace(/^\//, "")));
    if (TORRKJOR) {
      bildeCache.set(src, "image-torrkjoring");
      logg(`  ville lastet opp ${src} (${Math.round(fil.length / 1024)} KB)`);
    } else {
      const asset = await klient.assets.upload("image", fil, { filename: basename(src) });
      bildeCache.set(src, asset._id);
      logg(`  lastet opp ${src}`);
    }
  }
  return { _type: "bilde", alt, asset: { _type: "reference", _ref: bildeCache.get(src)! } };
}

let nokkel = 0;

/**
 * Gjør standardteksten om til dokumentform: lokale bilder lastes opp, og
 * arrayelementer får _key (Sanity krever det, ellers klager Studio).
 */
async function tilDokument(v: unknown): Promise<unknown> {
  if (Array.isArray(v)) {
    return Promise.all(v.map(async (x) => {
      const d = await tilDokument(x);
      return d && typeof d === "object" && !Array.isArray(d)
        ? { _key: `k${(nokkel++).toString(36)}`, ...(d as object) }
        : d;
    }));
  }
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    if (typeof o.src === "string" && typeof o.alt === "string") return lastOpp(o.src, o.alt);
    const ut: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(o)) ut[k] = await tilDokument(x);
    return ut;
  }
  return v;
}

// ---------------------------------------------------------------------------

const eksisterende = new Set(
  await klient.fetch<string[]>(`*[_id in $ids]._id`, { ids: Object.keys(STANDARDTEKSTER) })
);

const tx = klient.transaction();
let antall = 0;

for (const [id, tekst] of Object.entries(STANDARDTEKSTER)) {
  if (eksisterende.has(id)) {
    logg(`${id}: finnes allerede — røres ikke.`);
    continue;
  }

  const innhold = (await tilDokument(tekst)) as Record<string, unknown>;

  // Om oss: antall ansatte er en plassholder i standardteksten og settes inn
  // her, så kunden ser et vanlig tall i Studio.
  const hero = innhold.hero as Record<string, unknown> | undefined;
  if (hero && typeof hero.ingress === "string") {
    hero.ingress = hero.ingress.replace("{ansatte}", String(FAKTA_BEKREFTET.ansatte));
  }

  logg(`${id}: opprettes med ${Object.keys(innhold).join(", ")}.`);
  tx.createIfNotExists({ _id: id, _type: id, ...innhold });
  antall++;
}

if (antall === 0) {
  logg("\nIngenting å gjøre. Alle sidene finnes allerede.");
} else if (TORRKJOR) {
  logg(`\n${antall} sider ville blitt opprettet. Ingenting ble skrevet.`);
} else {
  await tx.commit();
  logg(`\n${antall} sider opprettet og publisert. Åpne Studio → Sider for å redigere.`);
}
