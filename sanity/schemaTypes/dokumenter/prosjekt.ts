import { defineType, defineField, defineArrayMember } from "sanity";

export const prosjekt = defineType({
  name: "prosjekt", title: "Prosjekt", type: "document",
  groups: [
    { name: "innhold", title: "Innhold", default: true },
    { name: "fakta",   title: "Fakta" },
    { name: "bilder",  title: "Bilder" },
    { name: "seo",     title: "SEO" },
  ],
  fields: [
    defineField({ name: "tittel", title: "Tittel", type: "string", group: "innhold", validation: (r) => r.required().max(80) }),
    defineField({
      name: "slug", title: "Nettadresse", type: "slug", group: "innhold",
      options: { source: "tittel", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "ingress", title: "Ingress", type: "text", rows: 3, group: "innhold",
      description: "Vises i kortet og som metabeskrivelse hvis SEO-feltet står tomt.",
      validation: (r) => r.required().min(30).max(200),
    }),

    defineField({
      name: "utfordring", title: "Utfordring", type: "array", of: [defineArrayMember({ type: "block" })], group: "innhold",
      description: "Hva var faktisk krevende? Dette er det eneste innholdet på nettstedet en språkmodell kan sitere uten å finne det samme hos ti andre entreprenører. Vær konkret.",
    }),
    defineField({ name: "losning",  title: "Løsning",  type: "array", of: [defineArrayMember({ type: "block" })], group: "innhold" }),
    defineField({ name: "resultat", title: "Resultat", type: "array", of: [defineArrayMember({ type: "block" })], group: "innhold" }),

    defineField({
      name: "kategori", title: "Kategori", type: "string", group: "fakta",
      options: { list: [
        { title: "Nybygg",         value: "nybygg"         },
        { title: "Rehabilitering", value: "rehabilitering" },
        { title: "Næringsbygg",    value: "naeringsbygg"   },
      ]},
      validation: (r) => r.required(),
    }),
    defineField({
      name: "status", title: "Status", type: "string", group: "fakta",
      options: { list: [{ title: "Ferdigstilt", value: "ferdig" }, { title: "Pågående", value: "pagaende" }] },
      initialValue: "ferdig",
    }),
    defineField({
      name: "fremdrift", title: "Fremdrift i prosent", type: "number", group: "fakta",
      description: "Kun for pågående prosjekter.",
      hidden: ({ parent }) => (parent as { status?: string })?.status !== "pagaende",
      validation: (r) => r.min(0).max(100),
    }),
    defineField({ name: "sted",     title: "Sted",     type: "string", group: "fakta", validation: (r) => r.required() }),
    defineField({ name: "aar",      title: "År",       type: "number", group: "fakta", validation: (r) => r.required().integer().min(1990).max(2035) }),
    defineField({ name: "varighet", title: "Varighet", type: "string", group: "fakta" }),
    defineField({ name: "klient",   title: "Oppdragsgiver", type: "string", group: "fakta", description: "La stå tom hvis kunden ikke vil navngis." }),
    defineField({
      name: "nokkeltall", title: "Nøkkeltall", type: "array", of: [{ type: "nokkeltall" }], group: "fakta",
      description: "Kvadratmeter, etasjer, varighet. Kun tall dere kan stå inne for.",
    }),
    defineField({ name: "prosjektleder", title: "Prosjektleder", type: "reference", to: [{ type: "teamMedlem" }], group: "fakta" }),
    defineField({ name: "tjeneste", title: "Tilhørende tjeneste", type: "reference", to: [{ type: "tjeneste" }], group: "fakta",
      description: "Gir prosjektet en vei tilbake til tjenestesiden." }),

    defineField({ name: "heroBilde", title: "Hovedbilde", type: "bilde", group: "bilder", validation: (r) => r.required() }),
    defineField({ name: "galleri",   title: "Galleri",    type: "array", of: [{ type: "bilde" }], group: "bilder" }),

    defineField({ name: "fremhevet", title: "Fremhev på forsiden", type: "boolean", group: "innhold", initialValue: false }),
    defineField({ name: "sortering", title: "Sortering", type: "number", group: "innhold", initialValue: 0 }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  orderings: [
    { title: "Nyeste først", name: "aarDesc", by: [{ field: "aar", direction: "desc" }] },
    { title: "Sortering",    name: "sort",    by: [{ field: "sortering", direction: "asc" }] },
  ],
  preview: {
    select: { title: "tittel", sted: "sted", aar: "aar", media: "heroBilde" },
    prepare: ({ title, sted, aar, media }) => ({ title, subtitle: [sted, aar].filter(Boolean).join(" · "), media }),
  },
});
