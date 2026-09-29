// src/lib/sanity/sider.ts
//
// Henter undersidene (Tjenester, Prosjekter, Om oss, Kontakt) fra Sanity og
// fyller hvert tomme felt fra standardteksten her.
//
// Fallback per felt, ikke per dokument. Forsiden stopper bygget hvis
// dokumentet mangler, fordi den ble migrert og alltid skal finnes. Disse
// sidene er nye, og dokumentene opprettes først når kunden publiserer dem
// (eller `npm run opprett-sider` kjøres). Å stoppe bygget i mellomtiden ville
// tatt ned hele nettstedet for en side som fungerer fint med standardteksten.
//
// Standardtekstene er det som sto hardkodet i sidene før. Nettstedet ser
// derfor likt ut til kunden endrer noe.

import { BRUKER_SANITY, sanityKlient } from "./client";
import { Q_SIDE } from "./queries";
import type { Bilde, RikTekst } from "@/content.config";
import { HOVEDKOMMUNER, NAP } from "@config/site";
import { VERDIER, HMS_PUNKTER } from "@config/om-oss";

type Seksjon = Record<string, any> & { _type: string; _key: string; tema?: string };
type SanityBildeObj = Bilde & Record<string, unknown>;

export type SideHero = {
  tittel: string;
  ingress: string;
  bilde?: SanityBildeObj | null;
  sitat?: string | null;
  sitatKilde?: string | null;
};

export type SideSeo = { tittel?: string | null; beskrivelse?: string | null; skjulFraSok?: boolean | null };

type Felles = { hero: SideHero; seksjoner: Seksjon[]; seo?: SideSeo | null };

export type TjenesterSide = Felles & { cta: { overskrift: string; tekst: string } };
export type ProsjekterSide = Felles & { galleriOverskrift: string };
export type OmOssSide = Felles & {
  team:    { overskrift: string; tekst: RikTekst };
  verdier: { overskrift: string; ingress: string; punkter: { kategori: string; tittel: string; tekst: string; bilde: SanityBildeObj }[] };
  hms:     { overskrift: string; tekst: RikTekst; punkter: string[]; boksTittel: string; boksTekst: string; boksSporsmaal: string; boksKnapp: string };
};
export type KontaktSide = Felles & {
  some: { overskrift: string; ingress: string; bilde?: SanityBildeObj | null };
  kartOverskrift: string;
  steg: { overskrift: string; punkter: { tittel: string; tekst: string }[] };
};

/**
 * sizes for herobildet på undersidene. Må være identisk i <HeroPage> og i
 * preloaden i BaseLayout, ellers laster nettleseren bildet to ganger.
 * Bildekolonnen skjules under 768 px; 1px der gjør at nettleseren velger den
 * minste varianten i stedet for å hente et fullt bilde som aldri vises.
 */
export const SIDEHERO_SIZES = "(max-width: 767px) 1px, (max-width: 1023px) 100vw, 45vw";

// ---------------------------------------------------------------------------
// Standardtekster
// ---------------------------------------------------------------------------

const lokalt = (src: string, alt: string, width = 800, height = 960): SanityBildeObj =>
  ({ src, alt, width, height }) as SanityBildeObj;

/** Portable Text-avsnitt, så standardteksten har samme form som Studio gir. */
const avsnitt = (...deler: (string | { kursiv: string })[]) => ({
  _type: "block", _key: Math.random().toString(36).slice(2, 10), style: "normal", markDefs: [],
  children: deler.map((d, i) =>
    typeof d === "string"
      ? { _type: "span", _key: `s${i}`, text: d, marks: [] }
      : { _type: "span", _key: `s${i}`, text: d.kursiv, marks: ["em"] }),
});

const FALLBACK = {
  tjenesterSide: {
    hero: {
      tittel: "To måter vi bygger på",
      ingress: `BRE Bygg er totalentreprenør i ${HOVEDKOMMUNER.join(", ")} og omegn. Du har én avtale og én prosjektleder, uansett hvilken av de to du trenger.`,
      bilde: lokalt("/images/tjenester/nybygg.jpg", "Byggeplass i Vestfold", 1069, 559),
    },
    cta: {
      overskrift: "Usikker på hvilken av dem du trenger?",
      tekst: `Ring ${NAP.phoneDisplay}, så finner vi ut av det sammen. Vi sier fra hvis vi ikke er riktig entreprenør for jobben.`,
    },
    seksjoner: [],
  } satisfies TjenesterSide,

  prosjekterSide: {
    hero: {
      tittel: "Prosjekter i Vestfold",
      ingress: "Vi viser hva vi tok på oss, hva som var krevende og hva vi faktisk leverte. Ingen prosjekter er identiske — men arbeidsmåten er den samme.",
      bilde: lokalt("/images/prosjekter-hero.webp", "Byggeplass i Vestfold med kran og stålkonstruksjon"),
    },
    // Var «Prosjekter i Vestfold», altså identisk med H1.
    galleriOverskrift: "Alle prosjekter",
    seksjoner: [],
  } satisfies ProsjekterSide,

  omOssSide: {
    hero: {
      tittel: "Totalentreprenør i Vestfold og Telemark",
      // Antall ansatte settes inn i hentOmOssSide, fra Innstillinger.
      ingress: "BRE Bygg er {ansatte} personer med base i Sandefjord. Vi leverer nybygg og rehabilitering i Tønsberg, Sandefjord, Larvik og Horten — som totalentreprenør, med én prosjektleder på hvert oppdrag.",
      bilde: lokalt("/images/om-oss-hero.webp", "BRE Bygg-team på byggeplass i Vestfold"),
      sitat: "Vi lever av anbefalinger. Det er det ærligste kvalitetsbeviset vi kan ha.",
      sitatKilde: "Rudi, BRE Bygg AS",
    },
    team: {
      overskrift: "Vi er tre erfarne fagfolk innen bygg",
      // Setningen «Alt fra kontorbygg, logistikk- og lagerhaller,
      // kombinasjonsbygg til leilighetskomplekser» er tatt ut: kontor- og
      // lagerbygg er næringsbygg, som BRE Bygg ikke tilbyr foreløpig.
      tekst: [
        avsnitt("Her er de du møter i prosjektfasen. Noen kamerater starter band, andre drømmer om en kaffebar. Vi? Vi startet et entreprenørfirma. Med solid erfaring fra byggebransjen og en felles forståelse av hva som virkelig betyr noe – kvalitet, sikkerhet og godt samarbeid – var det en selvfølge å bygge noe eget. ", { kursiv: "Bokstavelig talt." }),
        avsnitt("BRE Bygg er en totalentreprenør som leverer nøkkelferdige bygg."),
        avsnitt("Hos oss handler det ikke bare om stål, betong og stramme tidsfrister. Det handler om å gjøre ting ordentlig fra start til slutt. Vi vet at gode prosjekter ikke bare bygges med dyktige fagfolk og riktige materialer, men også med tillit, tydelig kommunikasjon og en dose godt humør underveis."),
        avsnitt("Kort sagt: Vi tar jobben på alvor, men oss selv akkurat passe uhøytidelig."),
      ] as RikTekst,
    },
    verdier: {
      overskrift: "Det vi faktisk mener",
      ingress: "Disse fire punktene er ikke plakater på veggen. De er beslutninger vi tar daglig — og som kundene våre merker over tid.",
      punkter: VERDIER.map((v) => ({
        kategori: v.kategori, tittel: v.tittel, tekst: v.tekst,
        bilde: lokalt(v.bilde, v.bildeAlt, 600, 400),
      })),
    },
    hms: {
      overskrift: "Helse, miljø og sikkerhet",
      tekst: [
        avsnitt("BRE Bygg er godkjent etter kravene i byggherreforskriften. Vi utarbeider SHA-plan for alle prosjekter og gjennomfører ukentlige vernerunder på aktive byggeplasser."),
        avsnitt("Krav til HMS-egenerklæring fra underentreprenører er ikke noe vi spør om — det er et vilkår for å jobbe med oss."),
      ] as RikTekst,
      punkter: [...HMS_PUNKTER],
      boksTittel: "Slik jobber vi med sikkerhet",
      boksTekst: "Dokumentasjon på godkjenninger sendes på forespørsel.",
      boksSporsmaal: "Trenger du HMS-egenerklæring eller sentralgodkjenningsbevis for et anbud?",
      boksKnapp: "Send forespørsel",
    },
    seksjoner: [],
  } satisfies OmOssSide,

  kontaktSide: {
    hero: {
      tittel: "Ta kontakt",
      ingress: "BRE Bygg svarer på henvendelser om byggeprosjekter i Vestfold og Telemark innen én arbeidsdag. Ring direkte eller send en e-post — så setter vi opp et møte uten forpliktelser.",
    },
    some: {
      overskrift: "Følg oss i sosiale medier",
      ingress: "Vi deler bilder og oppdateringer fra prosjektene våre underveis – fra grunnarbeid til overlevering.",
    },
    kartOverskrift: `Vi holder til i ${NAP.address.city}`,
    steg: {
      overskrift: "Hva skjer etter du tar kontakt?",
      punkter: [
        { tittel: "Vi svarer innen én arbeidsdag", tekst: "Enten per telefon eller e-post — avhengig av hva du brukte." },
        { tittel: "Møte på stedet eller digitalt", tekst: "Vi gjennomgår prosjektet ditt og avklarer omfang og tidsplan." },
        { tittel: "Konkret tilbud", tekst: "Ingen vage estimater. Du får et skriftlig tilbud med fast pris eller prisramme." },
      ],
    },
    seksjoner: [],
  } satisfies KontaktSide,
};

export type SideId = keyof typeof FALLBACK;

/** Standardtekstene, eksportert for scripts/opprett-sider.ts. */
export const STANDARDTEKSTER = FALLBACK;

// ---------------------------------------------------------------------------
// Fletting
// ---------------------------------------------------------------------------

const tom = (v: unknown) =>
  v === null || v === undefined || (typeof v === "string" && v.trim() === "") || (Array.isArray(v) && v.length === 0);

/** Bilder og rik tekst er blader: enten hele Sanity-verdien eller hele fallbacken. */
const erBlad = (v: unknown) =>
  Array.isArray(v) || (typeof v === "object" && v !== null && ("asset" in v || "src" in v));

/**
 * Sanity-verdien der den finnes, fallbacken der feltet er tomt.
 *
 * Rekursivt for objekter, så et tomt «sitat» i en ellers utfylt hero fortsatt
 * får standardsitatet. Felt som bare finnes i Sanity (seo), tas med som de er.
 */
export function flett<T>(fallback: T, data: unknown): T {
  if (tom(data)) return fallback;
  if (erBlad(data) || erBlad(fallback) || typeof data !== "object" || typeof fallback !== "object" || fallback === null) {
    return data as T;
  }
  const ut: Record<string, unknown> = { ...(data as Record<string, unknown>) };
  for (const [k, fb] of Object.entries(fallback as Record<string, unknown>)) {
    ut[k] = flett(fb, (data as Record<string, unknown>)[k]);
  }
  return ut as T;
}

async function hentSide<K extends SideId>(id: K): Promise<(typeof FALLBACK)[K]> {
  const fallback = FALLBACK[id];
  if (!BRUKER_SANITY) return fallback;

  const data = await sanityKlient().fetch<unknown>(Q_SIDE, { id });
  if (!data) {
    console.warn(
      `[sider] Fant ikke «${id}» i Sanity — bruker standardteksten fra koden.\n` +
      `        Publiser siden i /studio (Sider), eller kjør \`npm run opprett-sider\`.`
    );
  }
  return flett(fallback, data);
}

export const hentTjenesterSide  = () => hentSide("tjenesterSide")  as Promise<TjenesterSide>;
export const hentProsjekterSide = () => hentSide("prosjekterSide") as Promise<ProsjekterSide>;
export const hentKontaktSide    = () => hentSide("kontaktSide")    as Promise<KontaktSide>;

export async function hentOmOssSide(ansatte: number): Promise<OmOssSide> {
  const side = (await hentSide("omOssSide")) as OmOssSide;
  return { ...side, hero: { ...side.hero, ingress: side.hero.ingress.replace("{ansatte}", String(ansatte)) } };
}

/**
 * Herobildet til preload i BaseLayout. Bare Sanity-bilder: de får imagesrcset
 * med SIDEHERO_SIZES, der mobil velger den minste varianten. En lokal fil har
 * ingen srcset, og preload ville hentet hele bildet på mobil, der kolonnen er
 * skjult.
 */
export function heroPreloadBilde(bilde: SideHero["bilde"]) {
  return bilde && "asset" in bilde && bilde.asset ? bilde : undefined;
}

/** Sidens SEO-felt over standard-metaen i site.ts. */
export function medSeo<M extends { title: string; description: string; noindex?: boolean }>(meta: M, seo?: SideSeo | null): M {
  return {
    ...meta,
    title:       seo?.tittel      || meta.title,
    description: seo?.beskrivelse || meta.description,
    noindex:     seo?.skjulFraSok ?? meta.noindex ?? false,
  };
}
