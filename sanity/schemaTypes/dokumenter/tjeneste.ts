import { defineType, defineField } from "sanity";
import { rikTekstBlokker } from "../objekter/rikTekst";

export const tjeneste = defineType({
  name: "tjeneste", title: "Tjeneste", type: "document",
  // Faner, så avslutningen nederst på siden er lett å finne. Før lå alt i én
  // lang liste, og «Avslutning» var sammenslått nederst; kunden fant den ikke.
  groups: [
    { name: "innhold",       title: "Innhold", default: true },
    { name: "seksjoner",     title: "Seksjoner" },
    { name: "avslutning",    title: "Avslutning" },
    { name: "innstillinger", title: "Innstillinger" },
    { name: "seo",           title: "SEO" },
  ],
  fields: [
    defineField({ name: "tittel",     title: "Tittel", type: "string", group: "innhold", validation: (r) => r.required().max(80) }),
    defineField({ name: "kortTittel", title: "Kort tittel", type: "string", group: "innhold", description: "Til meny og bento-grid.", validation: (r) => r.max(40) }),
    defineField({ name: "slug", title: "Nettadresse", type: "slug", group: "innstillinger", options: { source: "tittel" }, validation: (r) => r.required() }),
    defineField({ name: "beskrivelse", title: "Kort beskrivelse", type: "text", group: "innhold", rows: 3, validation: (r) => r.required().min(30).max(200) }),
    defineField({
      name: "ingress", title: "Ingress", type: "text", rows: 4, group: "innhold",
      description: "Første avsnitt på siden. Slå fast hva vi gjør, for hvem og hvor.",
      validation: (r) => r.required().min(60),
    }),
    defineField({ name: "heroBilde", title: "Hovedbilde", type: "bilde", group: "innhold", validation: (r) => r.required() }),
    defineField({
      name: "bentoStorrelse", title: "Størrelse i bento-grid", type: "string", group: "innstillinger",
      options: { list: [
        { title: "Stor",     value: "large" },
        { title: "Liten",    value: "small" },
        { title: "Full bredde", value: "third" },
      ]},
      initialValue: "small",
    }),
    defineField({
      name: "kategori", title: "Prosjektkategori", type: "string", group: "innstillinger",
      description: "Kobler «se alle»-lenken til riktig filter på prosjektsiden.",
      options: { list: [
        { title: "Nybygg",         value: "nybygg"         },
        { title: "Rehabilitering", value: "rehabilitering" },
      ]},
      validation: (r) => r.required(),
    }),
    defineField({
      name: "inkludert", title: "Dette inngår", type: "array", of: [{ type: "string" }], group: "seksjoner",
      description: "Konkrete leveranser, ikke verdiløfter.",
      validation: (r) => r.min(3),
    }),
    defineField({
      name: "prosess", title: "Prosess", type: "array", group: "seksjoner",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "tittel", title: "Steg", type: "string", validation: (r) => r.required() }),
          defineField({ name: "tekst",  title: "Tekst", type: "text", rows: 3, validation: (r) => r.required() }),
        ],
        preview: { select: { title: "tittel" } },
      }],
      validation: (r) => r.min(3),
    }),
    defineField({
      name: "faq", title: "Spørsmål og svar", type: "array", of: [{ type: "faq" }], group: "seksjoner",
      description: "Tjenestespesifikke spørsmål. Ikke gjentak av forsidens — generiske FAQ-er blir ikke plukket opp av svarmotorer.",
    }),
    defineField({
      name: "brodtekst", title: "Brødtekst", type: "array", of: rikTekstBlokker(), group: "innhold",
      description: "Vises som egen seksjon rett under toppbildet på tjenestesiden. Bruk «Overskrift» for mellomtitler og punktliste i stedet for å skrive •.",
    }),
    defineField({ name: "relaterteProsjekter", title: "Relaterte prosjekter", type: "array", group: "seksjoner", of: [{ type: "reference", to: [{ type: "prosjekt" }] }] }),
    defineField({
      name: "overskrifter", title: "Seksjonsoverskrifter", type: "object", group: "seksjoner",
      description: "Tomt felt viser standardoverskriften, som står i grått i feltet.",
      fields: [
        defineField({ name: "inkludert", title: "Over «Dette inngår»", type: "string", placeholder: "Hva du får når vi tar totalentreprisen" }),
        defineField({ name: "prosess",   title: "Over «Prosess»",      type: "string", placeholder: "Fra første befaring til overlevering" }),
        defineField({ name: "relaterte", title: "Over relaterte prosjekter", type: "string", placeholder: "«Kort tittel» vi har levert" }),
        defineField({ name: "faq",       title: "Over spørsmål og svar", type: "string", placeholder: "Om «kort tittel»" }),
      ],
    }),
    defineField({
      name: "cta", title: "Avslutning", type: "object", group: "avslutning",
      description: "Den mørke boksen nederst på siden, med knappene «Ta kontakt» og telefon. Knappene er faste. Tomt felt viser teksten som står i grått.",
      fields: [
        defineField({ name: "overskrift", title: "Overskrift", type: "string", placeholder: "Skal du bygge i Tønsberg, Sandefjord, Larvik eller Horten?", validation: (r) => r.max(80) }),
        defineField({ name: "tekst", title: "Tekst", type: "text", rows: 2, placeholder: "Ring for en uforpliktende befaring. Vi sier fra med én gang hvis vi ikke er riktig entreprenør for jobben.", description: "Telefonnummeret blir automatisk en lenke." }),
      ],
    }),
    defineField({ name: "sortering", title: "Sortering", type: "number", group: "innstillinger", initialValue: 0 }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  orderings: [{ title: "Sortering", name: "sort", by: [{ field: "sortering", direction: "asc" }] }],
  preview: { select: { title: "tittel", subtitle: "kategori", media: "heroBilde" } },
});
