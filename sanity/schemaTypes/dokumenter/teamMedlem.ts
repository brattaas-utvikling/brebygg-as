import { defineType, defineField } from "sanity";

export const teamMedlem = defineType({
  name: "teamMedlem", title: "Person", type: "document",
  fields: [
    defineField({ name: "navn",  title: "Navn",  type: "string", validation: (r) => r.required() }),
    defineField({ name: "rolle", title: "Rolle", type: "string", validation: (r) => r.required(),
      description: "Går inn i JSON-LD som jobTitle. «Hvem er daglig leder i BRE Bygg» er et spørsmål AI-søk kan svare på og sitere." }),
    defineField({ name: "foto",  title: "Portrett", type: "bilde" }),
    defineField({ name: "epost", title: "E-post (direkte)", type: "string", validation: (r) => r.email() }),
    defineField({ name: "telefon", title: "Telefon (direkte)", type: "string" }),
    defineField({ name: "sortering", title: "Sortering", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "Sortering", name: "sort", by: [{ field: "sortering", direction: "asc" }] }],
  preview: { select: { title: "navn", subtitle: "rolle", media: "foto" } },
});
