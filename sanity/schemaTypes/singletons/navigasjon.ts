import { defineType, defineField } from "sanity";

export const navigasjon = defineType({
  name: "navigasjon", title: "Meny", type: "document",
  fields: [
    defineField({
      name: "hovedmeny", title: "Hovedmeny", type: "array",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "label", title: "Tekst", type: "string", validation: (r) => r.required() }),
          defineField({ name: "sti",   title: "Lenke", type: "string", validation: (r) => r.required() }),
          defineField({ name: "erCta", title: "Vis som knapp", type: "boolean", initialValue: false }),
        ],
        preview: { select: { title: "label", subtitle: "sti" } },
      }],
    }),
    defineField({
      name: "footerGrupper", title: "Footerkolonner", type: "array",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "overskrift", title: "Overskrift", type: "string", validation: (r) => r.required() }),
          defineField({
            name: "lenker", title: "Lenker", type: "array",
            of: [{
              type: "object",
              fields: [
                defineField({ name: "label", title: "Tekst", type: "string" }),
                defineField({ name: "sti",   title: "Lenke", type: "string" }),
              ],
              preview: { select: { title: "label", subtitle: "sti" } },
            }],
          }),
        ],
        preview: { select: { title: "overskrift" } },
      }],
    }),
    defineField({ name: "footerTekst", title: "Tekst i footeren", type: "text", rows: 3 }),
  ],
  preview: { prepare: () => ({ title: "Meny" }) },
});
