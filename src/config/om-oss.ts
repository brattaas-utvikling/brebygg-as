// src/config/om-oss.ts
// Data for Om oss-siden.
// Skilt fra site.ts fordi dette er presentasjonsdata, ikke NAP/schema-data.
//
// TEAM hentes fra «Personer» i Sanity. Lista under er fallback for bygg uten
// Sanity. Før september 2026 leste ingenting fra «Personer» — kunden kunne
// redigere personene i Studio uten at det nådde nettsiden.
//
// VERDIER og HMS_PUNKTER er standardtekster for «Om oss» i Sanity; se
// src/lib/sanity/sider.ts.

import { BRUKER_SANITY, sanityKlient } from "@lib/sanity/client";
import { Q_TEAM } from "@lib/sanity/queries";
import { beskaretUrl } from "@lib/sanity/image";
import type { Image } from "@sanity/types";

// --------------------------------------------------------------------------
// Teammedlemmer
// --------------------------------------------------------------------------

export type TeamMedlem = {
  navn:    string;
  rolle:   string;
  // Sti til bilde under /public/images/team/
  // Format: WebP, 400×500 px (portrett), maks 80 KB
  bilde:   string;
  bildeAlt: string;
  // Kontakt — vis kun om tilgjengelig
  epost?:  string;
  tlf?:    string;
  // Kort sitat i personens egne ord. Vises stort i teamslideren.
  // Står tomt til personen selv har godkjent ordlyden — ikke dikt opp.
  sitat?:  string;
};

const TEAM_FALLBACK: TeamMedlem[] = [
  {
    navn:     "Rudi Trogstad",
    rolle:    "Daglig leder",
    bilde:    "/images/team/rudi.webp",
    bildeAlt: "Daglig leder i BRE Bygg AS",
    epost:    "rudi@brebygg.no",
    tlf: "+47 452 22 385",
  },
  {
    navn:     "Bjørn Markeng",
    rolle:    "Prosjektleder",
    bilde:    "/images/team/bjorn.webp",
    bildeAlt: "Prosjektleder i BRE Bygg AS",
    epost: "bjorn@brebygg.no",
    tlf: "+47 982 65 670",
  },
  {
    navn:     "Emil T. Fevang",
    rolle:    "Prosjektleder",
    bilde:    "/images/team/emil.webp",
    bildeAlt: "Prosjektleder i BRE Bygg AS",
    epost: "emil@brebygg.no",
    tlf: "+47 455 00 188",
  }
] as const satisfies TeamMedlem[];

type SanityPerson = {
  navn: string; rolle: string; epost?: string | null; telefon?: string | null; sitat?: string | null;
  foto?: (Image & { alt?: string }) | null;
};

/**
 * Personene, i sorteringsrekkefølgen fra Studio.
 *
 * Portrettet beskjæres til 4:5 rundt hotspot, så alle får samme format uansett
 * hva som ble lastet opp. Mangler bildet, viser TeamSeksjon initialene.
 * Null personer i Sanity regnes som feil oppsett og gir fallbacken, ikke en
 * tom seksjon.
 */
async function hentTeam(): Promise<TeamMedlem[]> {
  if (!BRUKER_SANITY) return TEAM_FALLBACK;
  const personer = await sanityKlient().fetch<SanityPerson[]>(Q_TEAM);
  if (!personer?.length) {
    console.warn("[om-oss] Ingen personer i Sanity — bruker lista i om-oss.ts.");
    return TEAM_FALLBACK;
  }
  return personer.map((p) => ({
    navn:     p.navn,
    rolle:    p.rolle,
    bilde:    p.foto?.asset ? beskaretUrl(p.foto, 800, 1000) : "",
    bildeAlt: p.foto?.alt ?? `${p.rolle} i BRE Bygg AS`,
    epost:    p.epost ?? undefined,
    tlf:      p.telefon ?? undefined,
    sitat:    p.sitat ?? undefined,
  }));
}

export const TEAM: readonly TeamMedlem[] = await hentTeam();

// --------------------------------------------------------------------------
// Verdier
// --------------------------------------------------------------------------

export type Verdi = {
  nr:       string;         // "01", "02" osv.
  kategori: string;         // Kort kategorilabel
  tittel:   string;
  tekst:    string;
  // Bilde: WebP, 600×400 px, maks 120 KB
  // Plasser i /public/images/verdier/
  bilde:    string;
  bildeAlt: string;
};

export const VERDIER: Verdi[] = [
  {
    nr:       "01",
    kategori: "Ansvar",
    tittel:   "Tydelig ansvar",
    tekst:    "Som totalentreprenør sitter vi med ansvaret for hele leveransen — ikke bare vår del. Det betyr at du har én å ringe, uansett hva som dukker opp.",
    bilde:    "/images/verdier/ansvar.webp",
    bildeAlt: "Byggeplass med kran og stålkonstruksjon i Vestfold",
  },
  {
    nr:       "02",
    kategori: "Risiko",
    tittel:   "Ærlighet om risiko",
    tekst:    "Eldre bygg skjuler overraskelser. Vi sier det i tilbudet, ikke etter at vi har begynt. Det er ubehagelig i øyeblikket og riktig på lang sikt.",
    bilde:    "/images/verdier/risiko.webp",
    bildeAlt: "Rehabilitering av eldre bygg — synlige konstruksjonsdetaljer",
  },
  {
    nr:       "03",
    kategori: "Geografi",
    tittel:   "Lokal kunnskap",
    tekst:    "Vi kjenner kommunale krav i Tønsberg, Sandefjord, Larvik og Horten. Det sparer tid i søknadsfasen og reduserer antall overraskelser i byggeperioden.",
    bilde:    "/images/verdier/kunnskap.webp",
    bildeAlt: "Luftfoto over Vestfold-kystlinje",
  },
  {
    nr:       "04",
    kategori: "Leveranse",
    tittel:   "Fremdrift som holder",
    tekst:    "Vi setter opp fremdriftsplaner vi tror på, ikke planer som ser bra ut i tilbudet. Sklir noe, får du vite det samme uke — ikke på overleveringen.",
    bilde:    "/images/verdier/fremdrift.webp",
    bildeAlt: "Møte med fremdriftsplan og tegninger på bordet",
  },
] as const satisfies Verdi[];

// --------------------------------------------------------------------------
// HMS
//
// SERTIFISERINGER er fjernet fra v1. Lista inneholdt «Mesterbrev»,
// «Sentral godkjenning — Tiltaksklasse 2» og «Godkjent lærebedrift». Alle tre er
// lovregulerte påstander i Norge, og ingen av dem var verifisert. Legg dem
// tilbake når de er bekreftet mot Sentral godkjenning-registeret hos DiBK og
// mot mesterbrevregisteret — ikke før.
//
// MILEPÆLER er også fjernet: «50 prosjekter fullført» (2019), «120+ levert»
// (2024) og «kombinasjonsbygg på 2 400 m² i Larvik» (2011) hadde ingen dekning.
// HistorieSeksjon.astro er tatt ut av /om-oss/ inntil ekte milepæler foreligger.
// --------------------------------------------------------------------------

export const HMS_PUNKTER = [
  "Alle ansatte har HMS-kort på person.",
  "SHA-plan utarbeides for hvert prosjekt og gjennomgås med underentreprenører på oppstartsmøtet.",
  "Vernerunde gjennomføres ukentlig på aktive byggeplasser.",
  "Avviksskjema og nestenulykker registreres og følges opp — ikke legges i en skuff.",
  "Krav om gyldig HMS-egenerklæring fra alle underentreprenører før oppstart.",
] as const;
