// src/config/om-oss.ts
// Data for Om oss-siden.
// Skilt fra site.ts fordi dette er presentasjonsdata, ikke NAP/schema-data.
// Oppdater teammedlemmer og milepæler her — aldri hardkod i komponentene.

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
};

export const TEAM: TeamMedlem[] = [
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
    tekst:    "Vi setter opp realistiske fremdriftsplaner — ikke optimistiske. Prosjekter i Vestfold er levert innen avtalt tid i mer enn åtte av ti tilfeller.",
    bilde:    "/images/verdier/fremdrift.webp",
    bildeAlt: "Møte med fremdriftsplan og tegninger på bordet",
  },
] as const satisfies Verdi[];

// --------------------------------------------------------------------------
// Historiske milepæler
// --------------------------------------------------------------------------

export type Milepael = {
  aar:    number;
  tittel: string;
  tekst:  string;
};

export const MILEPÆLER: Milepael[] = [
  {
    aar:    2007,
    tittel: "BRE Bygg stiftes",
    tekst:
      "Selskapet etableres i Sandefjord med fokus på rehabilitering av eneboliger i Vestfold.",
  },
  {
    aar:    2011,
    tittel: "Første næringsbygg",
    tekst:
      "Første større næringsprosjekt leveres i Larvik — et kombinasjonsbygg med kontor og lager på 2 400 m².",
  },
  {
    aar:    2015,
    tittel: "Totalentreprise som hovedmodell",
    tekst:
      "BRE Bygg rendyrker totalentreprise-modellen. Antall parallelle prosjekter dobles i løpet av to år.",
  },
  {
    aar:    2019,
    tittel: "50 prosjekter fullført",
    tekst:
      "Halvparten av prosjektene dette året kom fra kunder eller samarbeidspartnere som hadde brukt oss tidligere.",
  },
  {
    aar:    2024,
    tittel: "120+ prosjekter levert",
    tekst:
      "Aktivitet i alle fire Vestfold-kommuner med faste samarbeidspartnere innen elektro, VVS og konstruksjon.",
  },
] as const satisfies Milepael[];

// --------------------------------------------------------------------------
// HMS og sertifiseringer
// --------------------------------------------------------------------------

export type Sertifisering = {
  navn:  string;
  // Valgfri kort forklaring
  info?: string;
};

export const SERTIFISERINGER: Sertifisering[] = [
  { navn: "Mesterbrev",                  info: "Godkjent mesterbedrift" },
  { navn: "HMS-egenerklæring",           info: "Oppdatert årlig" },
  { navn: "Sentral godkjenning",         info: "Tiltaksklasse 2" },
  { navn: "Godkjent lærebedrift",        info: "Opplæringskontoret Vestfold" },
  { navn: "Skatteattest",                info: "Oppdatert kvartalsvis" },
] as const satisfies Sertifisering[];

export const HMS_PUNKTER = [
  "Alle ansatte har HMS-kort på person.",
  "SHA-plan utarbeides for hvert prosjekt og gjennomgås med underentreprenører på oppstartsmøtet.",
  "Vernerunde gjennomføres ukentlig på aktive byggeplasser.",
  "Avviksskjema og nestenulykker registreres og følges opp — ikke legges i en skuff.",
  "Krav om gyldig HMS-egenerklæring fra alle underentreprenører før oppstart.",
] as const;

// // src/config/om-oss.ts
// // Data for Om oss-siden.
// // Skilt fra site.ts fordi dette er presentasjonsdata, ikke NAP/schema-data.
// // Oppdater teammedlemmer og milepæler her — aldri hardkod i komponentene.

// // --------------------------------------------------------------------------
// // Teammedlemmer
// // --------------------------------------------------------------------------

// export type TeamMedlem = {
//   navn:    string;
//   rolle:   string;
//   // Sti til bilde under /public/images/team/
//   // Format: WebP, 400×500 px (portrett), maks 80 KB
//   bilde:   string;
//   bildeAlt: string;
//   // Kontakt — vis kun om tilgjengelig
//   epost?:  string;
//   tlf?:    string;
// };

// export const TEAM: TeamMedlem[] = [
//   {
//     navn:     "Rudi Trogstad",
//     rolle:    "Daglig leder",
//     bilde:    "/images/team/rudi.webp",
//     bildeAlt: "Daglig leder i BRE Bygg AS",
//     epost:    "rudi@brebygg.no",
//     tlf: "+47 452 22 385",
//   },
//   {
//     navn:     "Bjørn Markeng",
//     rolle:    "Prosjektleder",
//     bilde:    "/images/team/bjorn.webp",
//     bildeAlt: "Prosjektleder i BRE Bygg AS",
//     epost: "bjorn@brebygg.no",
//     tlf: "+47 982 65 670",
//   },
//   {
//     navn:     "Emil T. Fevang",
//     rolle:    "Prosjektleder",
//     bilde:    "/images/team/emil.webp",
//     bildeAlt: "Prosjektleder i BRE Bygg AS",
//     epost: "emil@brebygg.no",
//     tlf: "+47 455 00 188",
//   }
// ] as const satisfies TeamMedlem[];

// // --------------------------------------------------------------------------
// // Verdier
// // --------------------------------------------------------------------------

// export type Verdi = {
//   // Enkelt Unicode-tegn eller emoji som ikon
//   ikon:   string;
//   tittel: string;
//   tekst:  string;
// };

// export const VERDIER: Verdi[] = [
//   {
//     ikon:   "◎",
//     tittel: "Tydelig ansvar",
//     tekst:
//       "Som totalentreprenør sitter vi med ansvaret for hele leveransen — ikke bare vår del. Det betyr at du har én å ringe, uansett hva som dukker opp.",
//   },
//   {
//     ikon:   "◈",
//     tittel: "Ærlighet om risiko",
//     tekst:
//       "Eldre bygg skjuler overraskelser. Vi sier det i tilbudet, ikke etter at vi har begynt. Det er ubehagelig i øyeblikket og riktig på lang sikt.",
//   },
//   {
//     ikon:   "◉",
//     tittel: "Lokal kunnskap",
//     tekst:
//       "Vi kjenner kommunale krav i Tønsberg, Sandefjord, Larvik og Horten. Det sparer tid i søknadsfasen og reduserer antall overraskelser i byggeperioden.",
//   },
//   {
//     ikon:   "◐",
//     tittel: "Fremdrift som holder",
//     tekst:
//       "Vi setter opp realistiske fremdriftsplaner — ikke optimistiske. Prosjekter i Vestfold er levert innen avtalt tid i mer enn åtte av ti tilfeller.",
//   },
// ] as const satisfies Verdi[];

// // --------------------------------------------------------------------------
// // Historiske milepæler
// // --------------------------------------------------------------------------

// export type Milepael = {
//   aar:    number;
//   tittel: string;
//   tekst:  string;
// };

// export const MILEPÆLER: Milepael[] = [
//   {
//     aar:    2007,
//     tittel: "BRE Bygg stiftes",
//     tekst:
//       "Selskapet etableres i Sandefjord med fokus på rehabilitering av eneboliger i Vestfold.",
//   },
//   {
//     aar:    2011,
//     tittel: "Første næringsbygg",
//     tekst:
//       "Første større næringsprosjekt leveres i Larvik — et kombinasjonsbygg med kontor og lager på 2 400 m².",
//   },
//   {
//     aar:    2015,
//     tittel: "Totalentreprise som hovedmodell",
//     tekst:
//       "BRE Bygg rendyrker totalentreprise-modellen. Antall parallelle prosjekter dobles i løpet av to år.",
//   },
//   {
//     aar:    2019,
//     tittel: "50 prosjekter fullført",
//     tekst:
//       "Halvparten av prosjektene dette året kom fra kunder eller samarbeidspartnere som hadde brukt oss tidligere.",
//   },
//   {
//     aar:    2024,
//     tittel: "120+ prosjekter levert",
//     tekst:
//       "Aktivitet i alle fire Vestfold-kommuner med faste samarbeidspartnere innen elektro, VVS og konstruksjon.",
//   },
// ] as const satisfies Milepael[];

// // --------------------------------------------------------------------------
// // HMS og sertifiseringer
// // --------------------------------------------------------------------------

// export type Sertifisering = {
//   navn:  string;
//   // Valgfri kort forklaring
//   info?: string;
// };

// export const SERTIFISERINGER: Sertifisering[] = [
//   { navn: "Mesterbrev",                  info: "Godkjent mesterbedrift" },
//   { navn: "HMS-egenerklæring",           info: "Oppdatert årlig" },
//   { navn: "Sentral godkjenning",         info: "Tiltaksklasse 2" },
//   { navn: "Godkjent lærebedrift",        info: "Opplæringskontoret Vestfold" },
//   { navn: "Skatteattest",                info: "Oppdatert kvartalsvis" },
// ] as const satisfies Sertifisering[];

// export const HMS_PUNKTER = [
//   "Alle ansatte har HMS-kort på person.",
//   "SHA-plan utarbeides for hvert prosjekt og gjennomgås med underentreprenører på oppstartsmøtet.",
//   "Vernerunde gjennomføres ukentlig på aktive byggeplasser.",
//   "Avviksskjema og nestenulykker registreres og følges opp — ikke legges i en skuff.",
//   "Krav om gyldig HMS-egenerklæring fra alle underentreprenører før oppstart.",
// ] as const;
