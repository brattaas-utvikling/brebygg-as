/**
 * scripts/oppdater-seo.ts
 *
 * Skriver SEO-tittel og metabeskrivelse til alle sidene i Sanity: forsiden,
 * de fem undersidene, tjenestene og prosjektene.
 *
 * Tekstene for forsiden og undersidene importeres fra PAGE_META i
 * src/config/site.ts, som også er reserven når feltet i Sanity står tomt. Da
 * finnes teksten ett sted. Tjenestene og prosjektene har ingen reserve i koden
 * (der brukes tittel og ingress), så tekstene deres står her.
 *
 * I motsetning til opprett-sider OVERSKRIVER dette skriptet det som står i
 * SEO-feltene. Tørrkjøringen viser før og etter for hvert felt. Les den først.
 * Felt som allerede har riktig tekst, hoppes over.
 *
 *   npm run oppdater-seo:torr
 *   SANITY_API_WRITE_TOKEN=sk... npm run oppdater-seo
 *
 * Tokenet må ha rollen Editor.
 */

import { createClient } from "@sanity/client";
import { loadEnv } from "vite";

const TORRKJOR = process.argv.includes("--torrkjor");

Object.assign(process.env, { ...loadEnv("development", process.cwd(), ""), ...process.env });

const { PAGE_META } = await import("../src/config/site");

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
      : "SANITY_API_WRITE_TOKEN mangler. Send den inline:\n" +
        "  SANITY_API_WRITE_TOKEN=sk... npm run oppdater-seo"
  );
}

const klient = createClient({ projectId, dataset, token, apiVersion: "2026-08-01", useCdn: false, perspective: "raw" });
const logg = (m: string) => console.log(`${TORRKJOR ? "[tørrkjøring] " : ""}${m}`);

type Seo = { tittel: string; beskrivelse: string };

// ---------------------------------------------------------------------------
// Tekstene
// ---------------------------------------------------------------------------

const fra = (m: { title: string; description: string }): Seo => ({ tittel: m.title, beskrivelse: m.description });

/** Singletons, nøklet på _id. */
const SIDER: Record<string, Seo> = {
  tjenesterSide:  fra(PAGE_META.tjenester),
  prosjekterSide: fra(PAGE_META.prosjekter),
  omOssSide:      fra(PAGE_META.omOss),
  baerekraftSide: fra(PAGE_META.baerekraft),
  kontaktSide:    fra(PAGE_META.kontakt),
};

/** Tjenester, nøklet på slug. */
const TJENESTER: Record<string, Seo> = {
  nybygg: {
    tittel: "Nybygg i Vestfold og Telemark | BRE Bygg",
    beskrivelse: "Vi bygger boliger og offentlige bygg i Vestfold og Telemark, og tar ansvaret for hele prosjektet fra planlegging til overlevering.",
  },
  rehabilitering: {
    tittel: "Rehabilitering av bygg i Vestfold | BRE Bygg",
    beskrivelse: "Vi rehabiliterer boliger og offentlige bygg i Vestfold. Før vi starter, skriver vi i tilbudet hva vi tror kan dukke opp i bygget.",
  },
};

/** Prosjekter, nøklet på slug. Bygger bare på det som står i prosjektets egen ingress. */
const PROSJEKTER: Record<string, Seo> = {
  "stensarmen-9": {
    tittel: "Stensarmen 9 i Tønsberg: hjelpemiddellager | BRE Bygg",
    beskrivelse: "Vi bygde om et tidligere covid-testsenter til hjelpemiddellager for Tønsberg kommune, med lavere energibruk og bedre bygningsstandard.",
  },
  slottsfjellskolen: {
    tittel: "Slottsfjellskolen i Tønsberg: rehabilitering | BRE Bygg",
    beskrivelse: "Vi rehabiliterer Slottsfjellskolen i Tønsberg. Over 100 vinduer byttes, og skolen får oppgraderte tekniske anlegg og nye energiløsninger.",
  },
  "usn-bakkenteigen": {
    tittel: "USN Campus Vestfold: ventilasjon og automatikk | BRE Bygg",
    beskrivelse: "Vi oppgraderer ventilasjon og automatikk ved USN Campus Vestfold på Bakkenteigen i Horten, for lavere energibruk og bedre inneklima.",
  },
  ntoa: {
    tittel: "Utomhusanlegg ved Oslofjord Convention Center | BRE Bygg",
    beskrivelse: "Nytt utomhusanlegg og aktivitetsområde ved Oslofjord Convention Center i Melsomvik, laget for både arrangementer og daglig bruk.",
  },
  nl20: {
    tittel: "NL20 i Tønsberg: ombygging av 4. etasje | BRE Bygg",
    beskrivelse: "Vi bygger om og innreder 4. etasje i Tønsberg Blad-bygget, med nye arbeidsplasser tilpasset leietakeren.",
  },
  modulbygg: {
    tittel: "Modulbasert lagerhall for Horten kommune | BRE Bygg",
    beskrivelse: "Vi bygde en modulbasert lagerhall for beredskapsutstyr til Horten kommune, med vekt på gjenbruk og lav energibruk i driften.",
  },
};

const FORSIDE: Seo = fra(PAGE_META.home);

// ---------------------------------------------------------------------------

type Dok = { _id: string; _type: string; slug?: string; tittel?: string; seo?: Partial<Seo> | null };

const dokumenter = await klient.fetch<Dok[]>(
  `*[_type in ["forside", "tjenesterSide", "prosjekterSide", "omOssSide", "baerekraftSide", "kontaktSide", "tjeneste", "prosjekt"]
     && !(_id in path("drafts.**"))]{ _id, _type, "slug": slug.current, tittel, seo { tittel, beskrivelse } }`
);
const utkast = new Set(await klient.fetch<string[]>(`*[_id in path("drafts.**")]._id`));

function onsket(d: Dok): Seo | undefined {
  if (d._type === "forside") return FORSIDE;
  if (d._type === "tjeneste") return d.slug ? TJENESTER[d.slug] : undefined;
  if (d._type === "prosjekt") return d.slug ? PROSJEKTER[d.slug] : undefined;
  return SIDER[d._id];
}

const tx = klient.transaction();
let endres = 0;
const advarsler: string[] = [];

for (const d of dokumenter) {
  const navn = `${d._type}${d.slug ? ` «${d.slug}»` : ""}`;
  const ny = onsket(d);
  if (!ny) {
    advarsler.push(`${navn}: ingen SEO-tekst i skriptet. Hoppet over.`);
    continue;
  }
  for (const [felt, tekst] of Object.entries(ny)) {
    const maks = felt === "tittel" ? 60 : 160;
    if (tekst.length > maks) advarsler.push(`${navn}: ${felt} er ${tekst.length} tegn (maks ${maks}).`);
  }
  if (d.seo?.tittel === ny.tittel && d.seo?.beskrivelse === ny.beskrivelse) {
    logg(`${navn}: allerede oppdatert.`);
    continue;
  }
  if (utkast.has(`drafts.${d._id}`)) {
    advarsler.push(`${navn}: har et upublisert utkast i Studio. Det publiserte dokumentet oppdateres, men utkastet har fortsatt gammel SEO og vil overskrive når det publiseres.`);
  }

  logg(`\n${navn}`);
  logg(`  tittel      før:   ${d.seo?.tittel ?? "(tom)"}`);
  logg(`              etter: ${ny.tittel}  (${ny.tittel.length} tegn)`);
  logg(`  beskrivelse før:   ${d.seo?.beskrivelse ?? "(tom)"}`);
  logg(`              etter: ${ny.beskrivelse}  (${ny.beskrivelse.length} tegn)`);

  tx.patch(d._id, (p) =>
    p.setIfMissing({ seo: { _type: "seo" } }).set({ "seo.tittel": ny.tittel, "seo.beskrivelse": ny.beskrivelse })
  );
  endres++;
}

for (const id of [...Object.keys(SIDER), "forside"]) {
  if (!dokumenter.some((d) => d._id === id || (id === "forside" && d._type === "forside"))) {
    advarsler.push(`${id}: finnes ikke i Sanity. Kjør npm run opprett-sider først.`);
  }
}

if (advarsler.length) logg(`\nMerk:\n${advarsler.map((a) => `  · ${a}`).join("\n")}`);

if (endres === 0) {
  logg("\nIngenting å gjøre. All SEO er allerede oppdatert.");
} else if (TORRKJOR) {
  logg(`\n${endres} dokumenter ville fått ny SEO. Ingenting ble skrevet.`);
} else {
  await tx.commit();
  logg(`\n${endres} dokumenter oppdatert og publisert.`);
}
