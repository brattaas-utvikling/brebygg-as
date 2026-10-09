// src/lib/sanity/queries.ts
// GROQ-spørringer.
//
// Fellesfragmenter øverst så feltlister ikke driftes fra hverandre mellom
// spørringer — samme problem som duplisert kode, bare i et annet språk.

const BILDE = `{
  ...,
  asset->{ _id, url, metadata { dimensions, lqip } }
}`;

const SEO = `seo { tittel, beskrivelse, skjulFraSok, ogBilde ${BILDE} }`;

const CTA = `{ tekst, url, stil }`;

/** Feltene et prosjektkort trenger. Brukes i karusell, galleri og relaterte. */
const PROSJEKT_KORT = `{
  "id": slug.current,
  tittel, ingress, sted, aar, kategori, status, fremhevet, sortering,
  heroBilde ${BILDE}
}`;

export const Q_INNSTILLINGER = `*[_type == "nettstedInnstillinger"][0]{
  navn, orgnummer, telefon, telefonVisning, epost,
  adresse, geo, aapningstider, omraader, hovedkommuner,
  antallAnsatte, stiftetAar, sertifiseringer,
  facebook, instagram, linkedin,
  logo ${BILDE}, standardOgBilde ${BILDE}
}`;

/**
 * Forsiden.
 *
 * Seksjonene hentes med _type intakt — blokk-dispatcheren i Astro velger
 * komponent ut fra den. Referanser løses opp her, ikke i komponenten, så
 * ingen komponent trenger å vite at data kommer fra Sanity.
 */
/** Blokkbiblioteket. Delt mellom forsiden og undersidenes tilleggsseksjoner. */
const SEKSJONER = `seksjoner[]{
    _type, _key, tema,
    overskrift, ingress, tekst, layout,
    bilde ${BILDE},
    cta ${CTA},
    knapper[] ${CTA},
    tall[]{ label, verdi },
    punkter[]{ label, verdi },
    sporsmaal[]{ sporsmaal, svar },
    antall, kunFremhevede, visSome,
    prosjekt-> ${PROSJEKT_KORT}
  }`;

export const Q_FORSIDE = `*[_type == "forside"][0]{
  hero {
    tittel, ingress,
    bilde ${BILDE},
    knapper[] ${CTA}
  },
  ${SEKSJONER},
  ${SEO}
}`;

/**
 * Undersidene (Tjenester, Prosjekter, Om oss, Kontakt).
 *
 * Én spørring for alle fire: felt som ikke finnes på en type, kommer tilbake
 * som null og fylles fra fallbacken i sider.ts. Det er billigere enn fire
 * spørringer som må holdes i takt med hvert sitt skjema.
 *
 * _id og ikke _type: singletonene har fast id lik typenavnet (desk-
 * strukturen), og et utkast med annen id skal aldri plukkes opp.
 */
export const Q_SIDE = `*[_id == $id][0]{
  hero { tittel, ingress, bilde ${BILDE}, sitat, sitatKilde },
  cta { overskrift, tekst },
  team { overskrift, tekst },
  verdier { overskrift, ingress, punkter[]{ kategori, tittel, tekst, bilde ${BILDE} } },
  hms { overskrift, tekst, punkter, boksTittel, boksTekst, boksSporsmaal, boksKnapp, bilde ${BILDE} },
  some { overskrift, ingress, bilde ${BILDE} },
  steg { overskrift, punkter[]{ tittel, tekst } },
  stripe { telefon, epost, adresse },
  kartOverskrift,
  galleriOverskrift,
  ${SEKSJONER},
  ${SEO}
}`;

/**
 * Feltene aliases til de engelske navnene Zod-skjemaet bruker.
 *
 * Dokumentmodellen i Sanity er på norsk fordi klienten leser den. Skjemaene i
 * content.config.ts er på engelsk fordi de kom fra markdown-frontmatteren.
 * GROQ er riktig sted å oversette mellom dem — da slipper vi å endre 40
 * komponenter, og markdown-fallbacken fungerer fortsatt.
 *
 * Uten aliasene feilet parseData på hvert eneste dokument og begge
 * collections ble tomme, uten at bygget stoppet.
 */
export const Q_PROSJEKTER = `*[_type == "prosjekt" && defined(slug.current)] | order(aar desc, sortering asc) {
  "id":             slug.current,
  "title":          tittel,
  "description":    ingress,
  "location":       sted,
  aar, varighet, kategori, status, fremdrift, klient,
  "fremhevet":      coalesce(fremhevet, false),
  "sortOrder":      coalesce(sortering, 0),
  "nokkeltall":     coalesce(nokkeltall[]{ label, verdi }, []),
  utfordring, losning, resultat,
  "heroImage":      heroBilde ${BILDE},
  "galleri":        coalesce(galleri[] ${BILDE}, []),
  prosjektleder->{ navn, rolle, epost, telefon },
  "tjeneste":       tjeneste->slug.current,
  "seoTitle":       seo.tittel,
  "seoDescription": seo.beskrivelse,
  "noindex":        coalesce(seo.skjulFraSok, false)
}`;

export const Q_TJENESTER = `*[_type == "tjeneste" && defined(slug.current)] | order(sortering asc) {
  "id":             slug.current,
  "title":          tittel,
  kortTittel,
  "description":    beskrivelse,
  ingress, kategori, brodtekst,
  "bentoStorrelse": coalesce(bentoStorrelse, "small"),
  "sortOrder":      coalesce(sortering, 0),
  "inkludert":      coalesce(inkludert, []),
  "prosess":        coalesce(prosess[]{ tittel, tekst }, []),
  "faq":            coalesce(faq[]{ sporsmaal, svar }, []),
  "heroImage":      heroBilde ${BILDE},
  "relaterteProsjekter": coalesce(relaterteProsjekter[]->slug.current, []),
  overskrifter { inkludert, prosess, relaterte, faq },
  cta { overskrift, tekst },
  "seoTitle":       seo.tittel,
  "seoDescription": seo.beskrivelse
}`;

/**
 * Siste nytt. $idag settes ved bygg: utløpte saker (visTil i fortiden) tas
 * ikke med. Fremhevede først, så nyeste.
 */
export const Q_NYHETER = `*[_type == "nyhet" && defined(tittel) && (!defined(visTil) || visTil >= $idag)]
  | order(coalesce(fremhevet, false) desc, dato desc) [0...$antall] {
  _id, tittel, dato, tekst, lenke, plattform,
  "fremhevet": coalesce(fremhevet, false),
  bilder[] ${BILDE}
}`;

export const Q_TEAM = `*[_type == "teamMedlem"] | order(sortering asc) {
  navn, rolle, epost, telefon, sortering, sitat, foto ${BILDE}
}`;
