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

export const Q_NAVIGASJON = `*[_type == "navigasjon"][0]{
  hovedmeny[]{ label, sti, erCta },
  footerGrupper[]{ overskrift, lenker[]{ label, sti } },
  footerTekst
}`;

/**
 * Forsiden.
 *
 * Seksjonene hentes med _type intakt — blokk-dispatcheren i Astro velger
 * komponent ut fra den. Referanser løses opp her, ikke i komponenten, så
 * ingen komponent trenger å vite at data kommer fra Sanity.
 */
export const Q_FORSIDE = `*[_type == "forside"][0]{
  hero {
    tittel, ingress,
    bilde ${BILDE},
    knapper[] ${CTA}
  },
  seksjoner[]{
    _type, _key, tema,
    overskrift, ingress, tekst, layout,
    bilde ${BILDE},
    cta ${CTA},
    knapper[] ${CTA},
    tall[]{ label, verdi },
    punkter[]{ label, verdi },
    sporsmaal[]{ sporsmaal, svar },
    antall, kunFremhevede,
    prosjekt-> ${PROSJEKT_KORT}
  },
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
  "seoTitle":       seo.tittel,
  "seoDescription": seo.beskrivelse
}`;

export const Q_TEAM = `*[_type == "teamMedlem"] | order(sortering asc) {
  navn, rolle, epost, telefon, sortering, foto ${BILDE}
}`;

// Q_SIDE er fjernet sammen med `side`-typen. Trengs den igjen, må både
// skjemaet, desk-oppføringen og rutene for /om-oss/ og /kontakt/ på plass
// samtidig — en spørring uten en rute som bruker den er bare dødvekt.
