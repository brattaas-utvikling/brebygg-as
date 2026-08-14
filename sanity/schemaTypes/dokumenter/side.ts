import { defineType, defineField, defineArrayMember } from "sanity";

/** Generisk side. Brukes til om-oss og kontakt, som har fast struktur i koden
 *  men redigerbar tekst. */
export const side = defineType({
  name: "side", title: "Side", type: "document",
  fields: [
    defineField({ name: "tittel", title: "Tittel", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug",   title: "Nettadresse", type: "slug", options: { source: "tittel" }, validation: (r) => r.required() }),
    defineField({ name: "eyebrow", title: "Liten overskrift", type: "string" }),
    defineField({ name: "ingress", title: "Ingress", type: "text", rows: 4 }),
    defineField({ name: "heroBilde", title: "Hovedbilde", type: "bilde" }),
    defineField({ name: "innhold", title: "Innhold", type: "array", of: [defineArrayMember({ type: "block" })] }),
    defineField({ name: "sitat",      title: "Sitat", type: "text", rows: 2 }),
    defineField({ name: "sitatKilde", title: "Sitat — kilde", type: "string" }),
    defineField({ name: "verdier",    title: "Verdier", type: "array", of: [{ type: "verdi" }] }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  preview: { select: { title: "tittel", subtitle: "slug.current" } },
});
