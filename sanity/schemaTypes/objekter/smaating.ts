import { defineType, defineField } from "sanity";

export const cta = defineType({
  name: "cta", title: "Knapp", type: "object",
  fields: [
    defineField({ name: "tekst", title: "Knappetekst", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "url", title: "Lenke", type: "string",
      description: "Intern sti som /prosjekter/, eller tel:/mailto: for kontakt.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "stil", title: "Utseende", type: "string",
      options: { list: [{ title: "Fylt", value: "primary" }, { title: "Kantlinje", value: "outline" }] },
      initialValue: "primary",
    }),
  ],
  preview: { select: { title: "tekst", subtitle: "url" } },
});

export const nokkeltall = defineType({
  name: "nokkeltall", title: "Nøkkeltall", type: "object",
  fields: [
    defineField({ name: "label", title: "Hva det er", type: "string", validation: (r) => r.required() }),
    defineField({ name: "verdi", title: "Verdi",      type: "string", validation: (r) => r.required() }),
  ],
  preview: { select: { title: "verdi", subtitle: "label" } },
});

export const faq = defineType({
  name: "faq", title: "Spørsmål og svar", type: "object",
  fields: [
    defineField({ name: "sporsmaal", title: "Spørsmål", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "svar", title: "Svar", type: "text", rows: 4,
      description: "Svar direkte i første setning. AI-søkemotorer siterer avsnitt som besvarer ett spørsmål.",
      validation: (r) => r.required(),
    }),
  ],
  preview: { select: { title: "sporsmaal" } },
});

export const verdi = defineType({
  name: "verdi", title: "Verdi", type: "object",
  fields: [
    defineField({ name: "nr",       title: "Nummer",   type: "string" }),
    defineField({ name: "kategori", title: "Kategori", type: "string" }),
    defineField({ name: "tittel",   title: "Tittel",   type: "string", validation: (r) => r.required() }),
    defineField({ name: "tekst",    title: "Tekst",    type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({ name: "bilde",    title: "Bilde",    type: "bilde" }),
  ],
  preview: { select: { title: "tittel", subtitle: "kategori" } },
});
