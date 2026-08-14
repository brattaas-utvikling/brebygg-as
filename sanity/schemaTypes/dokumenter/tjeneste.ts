import { defineType, defineField, defineArrayMember } from "sanity";

export const tjeneste = defineType({
  name: "tjeneste", title: "Tjeneste", type: "document",
  fields: [
    defineField({ name: "tittel",     title: "Tittel", type: "string", validation: (r) => r.required().max(80) }),
    defineField({ name: "kortTittel", title: "Kort tittel", type: "string", description: "Til meny og bento-grid.", validation: (r) => r.max(40) }),
    defineField({ name: "slug", title: "Nettadresse", type: "slug", options: { source: "tittel" }, validation: (r) => r.required() }),
    defineField({ name: "beskrivelse", title: "Kort beskrivelse", type: "text", rows: 3, validation: (r) => r.required().min(30).max(200) }),
    defineField({
      name: "ingress", title: "Ingress", type: "text", rows: 4,
      description: "Første avsnitt på siden. Slå fast hva vi gjør, for hvem og hvor.",
      validation: (r) => r.required().min(60),
    }),
    defineField({ name: "heroBilde", title: "Hovedbilde", type: "bilde", validation: (r) => r.required() }),
    defineField({
      name: "bentoStorrelse", title: "Størrelse i bento-grid", type: "string",
      options: { list: [
        { title: "Stor",     value: "large" },
        { title: "Liten",    value: "small" },
        { title: "Full bredde", value: "third" },
      ]},
      initialValue: "small",
    }),
    defineField({
      name: "kategori", title: "Prosjektkategori", type: "string",
      description: "Kobler «se alle»-lenken til riktig filter på prosjektsiden.",
      options: { list: [
        { title: "Nybygg",         value: "nybygg"         },
        { title: "Rehabilitering", value: "rehabilitering" },
        { title: "Næringsbygg",    value: "naeringsbygg"   },
      ]},
      validation: (r) => r.required(),
    }),
    defineField({
      name: "inkludert", title: "Dette inngår", type: "array", of: [{ type: "string" }],
      description: "Konkrete leveranser, ikke verdiløfter.",
      validation: (r) => r.min(3),
    }),
    defineField({
      name: "prosess", title: "Prosess", type: "array",
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
      name: "faq", title: "Spørsmål og svar", type: "array", of: [{ type: "faq" }],
      description: "Tjenestespesifikke spørsmål. Ikke gjentak av forsidens — generiske FAQ-er blir ikke plukket opp av svarmotorer.",
    }),
    defineField({ name: "brodtekst", title: "Brødtekst", type: "array", of: [defineArrayMember({ type: "block" })] }),
    defineField({ name: "relaterteProsjekter", title: "Relaterte prosjekter", type: "array", of: [{ type: "reference", to: [{ type: "prosjekt" }] }] }),
    defineField({ name: "sortering", title: "Sortering", type: "number", initialValue: 0 }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  orderings: [{ title: "Sortering", name: "sort", by: [{ field: "sortering", direction: "asc" }] }],
  preview: { select: { title: "tittel", subtitle: "kategori", media: "heroBilde" } },
});
