import { defineType, defineField } from "sanity";

/**
 * Siste nytt.
 *
 * Manuell arbeidsflyt: kunden legger ut innlegget på sosiale medier som
 * vanlig, og oppretter så en sak her med bilde(r), kort tekst og lenke til
 * innlegget. Forsideblokken «Siste nytt» viser de nyeste sakene.
 *
 * Bevisst ikke en automatisk feed: Instagram krever Meta-app og token som må
 * fornyes, LinkedIn krever partnergodkjenning, og tredjepartswidgets setter
 * cookies. En automatisk import kan senere skrive til denne samme typen uten
 * endringer i nettsiden.
 */
export const nyhet = defineType({
  name: "nyhet", title: "Nyhet", type: "document",
  fields: [
    defineField({ name: "tittel", title: "Tittel", type: "string", validation: (r) => r.required().max(80) }),
    defineField({
      name: "dato", title: "Dato", type: "date",
      initialValue: () => new Date().toISOString().slice(0, 10),
      options: { dateFormat: "DD.MM.YYYY" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "bilder", title: "Bilder", type: "array", of: [{ type: "bilde" }],
      description: "Ett til ti bilder. Flere bilder blir en bildekarusell i saken.",
      options: { layout: "grid" },
      validation: (r) => r.required().min(1).max(10),
    }),
    defineField({
      name: "tekst", title: "Tekst", type: "text", rows: 4,
      description: "Kort — to–tre setninger. Vises i kortet på forsiden.",
      validation: (r) => r.max(300).warning("Over 300 tegn blir lang i kortet."),
    }),
    defineField({
      name: "lenke", title: "Lenke", type: "url",
      description: "Valgfri. Lenke til innlegget på sosiale medier, eller en annen side.",
      validation: (r) => r.uri({ scheme: ["https", "http"] }),
    }),
    defineField({
      name: "plattform", title: "Hvor lenken går", type: "string",
      description: "Styrer lenketeksten, for eksempel «Se innlegget på Instagram».",
      options: { list: [
        { title: "LinkedIn",  value: "linkedin" },
        { title: "Instagram", value: "instagram" },
        { title: "Facebook",  value: "facebook" },
        { title: "Annet",     value: "annet" },
      ], layout: "radio", direction: "horizontal" },
      hidden: ({ parent }) => !(parent as { lenke?: string })?.lenke,
    }),
    defineField({
      name: "fremhevet", title: "Fremhev på forsiden", type: "boolean", initialValue: false,
      description: "Fremhevede saker vises først, uansett dato.",
    }),
    defineField({
      name: "visTil", title: "Vis til og med", type: "date",
      options: { dateFormat: "DD.MM.YYYY" },
      description: "Valgfri. Saken skjules etter denne datoen. Merk: nettsiden bygges på nytt ved publisering, så en utløpt sak forsvinner ved neste bygg.",
    }),
  ],
  orderings: [{ title: "Nyeste først", name: "datoDesc", by: [{ field: "dato", direction: "desc" }] }],
  preview: {
    select: { title: "tittel", dato: "dato", fremhevet: "fremhevet", media: "bilder.0" },
    prepare: ({ title, dato, fremhevet, media }) => ({
      title,
      subtitle: [dato ? dato.split("-").reverse().join(".") : null, fremhevet ? "fremhevet" : null].filter(Boolean).join(" · "),
      media,
    }),
  },
});
