/**
 * scripts/migrer-innhold.ts
 *
 * Engangsmigrering fra repoet til Sanity.
 *
 * Kilden er koden selv, ikke en ekstern database: src/config/*.ts og
 * markdown-filene i src/content/. Skriptet sjekkes inn slik at migreringen er
 * reproduserbar — kjøres den to ganger, oppdateres de samme dokumentene i
 * stedet for at det lages duplikater (createOrReplace med deterministiske
 * _id-er).
 *
 * Kjør:
 *   SANITY_API_WRITE_TOKEN=sk... npx tsx scripts/migrer-innhold.ts
 *   SANITY_API_WRITE_TOKEN=sk... npx tsx scripts/migrer-innhold.ts --torrkjor
 *
 * --torrkjor skriver ingenting. Kjør den først.
 *
 * Tokenet må ha rollen Editor og lages under Manage → API → Tokens. Det er et
 * annet token enn SANITY_API_READ_TOKEN i .env, og skal ikke ligge der.
 */

import { createClient } from "@sanity/client";
import { readFile, readdir } from "node:fs/promises";
import { basename, join } from "node:path";
import matter from "gray-matter";

const TORRKJOR = process.argv.includes("--torrkjor");

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset   = process.env.PUBLIC_SANITY_DATASET ?? "production";
const token     = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId) throw new Error("PUBLIC_SANITY_PROJECT_ID mangler.");
if (!token && !TORRKJOR) throw new Error("SANITY_API_WRITE_TOKEN mangler. Kjør med --torrkjor for å teste uten å skrive.");

const klient = createClient({ projectId, dataset, token, apiVersion: "2026-08-01", useCdn: false });

// ---------------------------------------------------------------------------
// Hjelpere
// ---------------------------------------------------------------------------

const logg = (melding: string) => console.log(`${TORRKJOR ? "[tørrkjøring] " : ""}${melding}`);

/** Deterministisk id, så gjentatte kjøringer oppdaterer i stedet for å duplisere. */
const idFor = (type: string, slug: string) => `${type}.${slug}`;

async function skriv(dok: Record<string, unknown> & { _id: string; _type: string }) {
  if (TORRKJOR) {
    logg(`ville skrevet ${dok._type} → ${dok._id}`);
    return;
  }
  await klient.createOrReplace(dok as never);
  logg(`skrev ${dok._type} → ${dok._id}`);
}

/**
 * Laster opp et bilde fra /public og returnerer en asset-referanse.
 *
 * Bilder som ikke finnes hoppes over med advarsel i stedet for å stoppe
 * migreringen — plassholderbilder skal uansett byttes av klienten etterpå.
 */
const bildeCache = new Map<string, string | null>();

async function lastOppBilde(sti: string, alt: string): Promise<Record<string, unknown> | undefined> {
  if (!sti) return undefined;

  if (!bildeCache.has(sti)) {
    try {
      const fil = await readFile(join("public", sti.replace(/^\//, "")));
      if (TORRKJOR) {
        bildeCache.set(sti, "image-torrkjoring");
      } else {
        const asset = await klient.assets.upload("image", fil, { filename: basename(sti) });
        bildeCache.set(sti, asset._id);
        logg(`  lastet opp bilde ${sti}`);
      }
    } catch {
      console.warn(`  ADVARSEL: fant ikke ${sti} — hopper over.`);
      bildeCache.set(sti, null);
    }
  }

  const assetId = bildeCache.get(sti);
  if (!assetId) return undefined;

  return { _type: "image", alt, asset: { _type: "reference", _ref: assetId } };
}

/** Markdown → Portable Text. Bevisst enkel: avsnitt og overskrifter. */
function tilPortableText(markdown: string): Record<string, unknown>[] {
  return markdown
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((blokk, i) => {
      const overskrift = blokk.match(/^(#{2,3})\s+(.*)$/);
      const style = overskrift ? (overskrift[1]!.length === 2 ? "h2" : "h3") : "normal";
      const tekst = overskrift ? overskrift[2]! : blokk.replace(/\n/g, " ");
      return {
        _type: "block",
        _key:  `b${i}`,
        style,
        markDefs: [],
        children: [{ _type: "span", _key: `s${i}`, text: tekst, marks: [] }],
      };
    });
}

async function lesMarkdown(mappe: string) {
  const filer = (await readdir(mappe)).filter((f) => f.endsWith(".md") && !f.startsWith("_"));
  return Promise.all(
    filer.map(async (f) => {
      const rå = await readFile(join(mappe, f), "utf8");
      const { data, content } = matter(rå);
      return { slug: f.replace(/\.md$/, ""), data: data as Record<string, any>, content };
    })
  );
}

// ---------------------------------------------------------------------------
// Migrering
// ---------------------------------------------------------------------------

async function migrerInnstillinger() {
  const { NAP, OPENING_HOURS, AREA_SERVED, HOVEDKOMMUNER, FAKTA_BEKREFTET, SOCIAL } =
    await import("../src/config/site.js");

  await skriv({
    _id:   "nettstedInnstillinger",
    _type: "nettstedInnstillinger",
    navn:           NAP.name,
    orgnummer:      NAP.orgNumber,
    telefon:        NAP.phone,
    telefonVisning: NAP.phoneDisplay,
    epost:          NAP.email,
    adresse: {
      gate:   NAP.address.street,
      postnr: NAP.address.postalCode,
      sted:   NAP.address.city,
      region: NAP.address.region,
    },
    geo:            { lat: NAP.geo.latitude, lng: NAP.geo.longitude },
    aapningstider:  OPENING_HOURS.display,
    omraader:       [...AREA_SERVED],
    hovedkommuner:  [...HOVEDKOMMUNER],
    antallAnsatte:  FAKTA_BEKREFTET.ansatte,
    // stiftetAar og sertifiseringer bevisst utelatt — begge er ubekreftede.
    // Se FAKTA_UBEKREFTET i site.ts. De skal fylles inn i Studio når de er
    // verifisert, ikke migreres inn som sannhet.
    facebook:  SOCIAL.facebook,
    instagram: SOCIAL.instagram,
    linkedin:  SOCIAL.linkedin,
  });
}

async function migrerTeam() {
  const { TEAM } = await import("../src/config/om-oss.js");
  for (const [i, m] of TEAM.entries()) {
    const slug = m.navn.toLowerCase()
      .replace(/æ/g, "ae").replace(/ø/g, "oe").replace(/å/g, "aa")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    await skriv({
      _id:   idFor("teamMedlem", slug),
      _type: "teamMedlem",
      navn:  m.navn,
      rolle: m.rolle,
      epost: m.epost,
      telefon: m.tlf,
      sortering: i,
      foto: m.bilde ? await lastOppBilde(m.bilde, `${m.navn}, ${m.rolle}`) : undefined,
    });
  }
}

async function migrerTjenester() {
  const tjenester = await lesMarkdown("src/content/tjenester");
  for (const t of tjenester) {
    await skriv({
      _id:   idFor("tjeneste", t.slug),
      _type: "tjeneste",
      tittel:      t.data.title,
      kortTittel:  t.data.kortTittel,
      slug:        { _type: "slug", current: t.slug },
      beskrivelse: t.data.description,
      ingress:     t.data.ingress,
      kategori:    t.data.kategori,
      bentoStorrelse: t.data.bentoStorrelse ?? "small",
      sortering:   t.data.sortOrder ?? 0,
      inkludert:   t.data.inkludert ?? [],
      prosess:     (t.data.prosess ?? []).map((p: any, i: number) => ({ _key: `p${i}`, ...p })),
      faq:         (t.data.faq ?? []).map((f: any, i: number) => ({ _type: "faq", _key: `f${i}`, ...f })),
      brodtekst:   tilPortableText(t.content),
      heroBilde:   await lastOppBilde(t.data.heroImage?.src, t.data.heroImage?.alt ?? t.data.title),
      seo: { tittel: t.data.seoTitle, beskrivelse: t.data.seoDescription },
    });
  }
}

async function migrerProsjekter() {
  const prosjekter = await lesMarkdown("src/content/prosjekter");
  for (const p of prosjekter) {
    await skriv({
      _id:   idFor("prosjekt", p.slug),
      _type: "prosjekt",
      tittel:    p.data.title,
      slug:      { _type: "slug", current: p.slug },
      ingress:   p.data.description,
      kategori:  p.data.kategori,
      status:    p.data.status ?? "ferdig",
      fremdrift: p.data.fremdrift,
      sted:      p.data.location,
      aar:       p.data.aar,
      varighet:  p.data.varighet,
      klient:    p.data.klient,
      fremhevet: p.data.fremhevet ?? false,
      // Tjeneste-referansen utledes av kategorien: tjenesteslugene er nybygg,
      // rehabilitering og naeringsbygg, altså nøyaktig de tre kategoriverdiene.
      // Det gir prosjektet en vei tilbake til tjenestesiden uten manuell
      // kobling i Studio etterpå.
      tjeneste: p.data.kategori
        ? { _type: "reference", _ref: idFor("tjeneste", p.data.kategori) }
        : undefined,
      sortering: p.data.sortOrder ?? 0,
      // MERK: nøkkeltallene i markdown-filene er AI-genererte og ikke
      // verifisert. De migreres for at sidene ikke skal bli tomme, men skal
      // erstattes med ekte tall i Studio før lansering. Se MIGRERING.md.
      nokkeltall: (p.data.nokkeltall ?? []).map((n: any, i: number) => ({ _key: `n${i}`, ...n })),
      utfordring: p.data.utfordring ? tilPortableText(p.data.utfordring) : undefined,
      losning:    p.data.losning    ? tilPortableText(p.data.losning)    : undefined,
      resultat:   p.data.resultat   ? tilPortableText(p.data.resultat)   : undefined,
      heroBilde:  await lastOppBilde(p.data.heroImage?.src, p.data.heroImage?.alt ?? p.data.title),
      galleri:    await Promise.all(
        (p.data.galleri ?? []).map((g: any) => lastOppBilde(g.src, g.alt))
      ).then((liste) => liste.filter(Boolean).map((b, i) => ({ ...(b as object), _key: `g${i}` }))),
      seo: { tittel: p.data.seoTitle, beskrivelse: p.data.seoDescription },
    });
  }
}

async function migrerNavigasjon() {
  const { MAIN_NAV, FOOTER_NAV } = await import("../src/config/navigation.js");
  await skriv({
    _id:   "navigasjon",
    _type: "navigasjon",
    hovedmeny: MAIN_NAV.map((l: any, i: number) => ({
      _key: `m${i}`, label: l.label, sti: l.href, erCta: l.isCta ?? false,
    })),
    // FOOTER_NAV er et array av { heading, items }, ikke et objekt.
    // Fanget i tørrkjøring — Object.entries() ga [nøkkel, gruppe] og
    // gruppe.map() fantes ikke.
    footerGrupper: FOOTER_NAV.map((g: any, i: number) => ({
      _key: `g${i}`,
      overskrift: g.heading,
      lenker: (g.items ?? []).map((l: any, j: number) => ({ _key: `l${j}`, label: l.label, sti: l.href })),
    })),
  });
}

/**
 * Forsiden.
 *
 * Rekkefølgen speiler dagens forside med vilje. Klienten skal kjenne igjen
 * siden sin når hun åpner Studio første gang — ikke møte en tom liste.
 */
async function migrerForside() {
  const { FAQ_ITEMS, NOKKELTALL, HOVEDKOMMUNER, NAP } = await import("../src/config/site.js");

  await skriv({
    _id:   "forside",
    _type: "forside",
    hero: {
      eyebrow: `Totalentreprenør i ${HOVEDKOMMUNER.join(", ")}`,
      tittel:  "Totalentreprenør i Vestfold",
      ingress: "BRE Bygg tar fullt ansvar for byggeprosessen — fra prosjektering til du får nøklene. Enten det er nybygg i Tønsberg, rehabilitering i Sandefjord eller næringsbygg i Larvik.",
      bilde:   await lastOppBilde("/images/hero-forside.webp", "Byggeplass i Vestfold"),
      knapper: [
        { _key: "k1", tekst: "Se prosjekter",  url: "/prosjekter/", stil: "primary" },
        { _key: "k2", tekst: NAP.phoneDisplay, url: NAP.phoneHref,  stil: "outline" },
      ],
      tall: NOKKELTALL.map((t, i) => ({ _key: `t${i}`, label: t.label, verdi: t.num })),
    },
    seksjoner: [
      { _type: "tjenesterBento",   _key: "s1", tema: "mork",
        eyebrow: "Hva vi gjør", overskrift: "Tre typer oppdrag. Én ansvarlig." },
      { _type: "prosjektKarusell", _key: "s2", tema: "lys",
        eyebrow: "Utvalgte prosjekter", overskrift: "Bygg vi har levert i Vestfold", antall: 8 },
      { _type: "faqBlokk",         _key: "s3", tema: "seksjon",
        eyebrow: "Vanlige spørsmål", overskrift: "Det folk lurer på",
        sporsmaal: FAQ_ITEMS.map((f, i) => ({ _type: "faq", _key: `q${i}`, sporsmaal: f.question, svar: f.answer })) },
      { _type: "ctaBanner",        _key: "s4", tema: "mork",
        overskrift: "Skal du bygge i Vestfold?",
        tekst: "Ring for en uforpliktende befaring. Vi sier fra med én gang hvis vi ikke er riktig entreprenør for jobben.",
        knapper: [{ _key: "c1", tekst: `Ring ${NAP.phoneDisplay}`, url: NAP.phoneHref, stil: "primary" }] },
    ],
  });
}

// ---------------------------------------------------------------------------

async function main() {
  logg(`Migrerer til ${projectId}/${dataset}\n`);

  // Rekkefølgen betyr noe: prosjekter refererer til teamMedlem og tjeneste,
  // så de må finnes først.
  await migrerInnstillinger();
  await migrerNavigasjon();
  await migrerTeam();
  await migrerTjenester();
  await migrerProsjekter();
  await migrerForside();

  logg("\nFerdig.");
  if (TORRKJOR) logg("Ingenting ble skrevet. Kjør uten --torrkjor for å migrere.");
  else {
    logg("\nNeste steg:");
    logg("  1. Sett prosjektleder på hvert prosjekt i Studio (kan ikke utledes).");
    logg("  2. Bytt de AI-genererte nøkkeltallene på prosjektene med ekte tall.");
    logg("  3. Sett PUBLIC_SANITY_PROJECT_ID i .env og kjør npm run build.");
    logg("  4. Når bygget er verifisert: slett src/content/ og markdown-grenen i content.config.ts.");
  }
}

main().catch((feil) => {
  console.error("Migreringen feilet:", feil);
  process.exit(1);
});
