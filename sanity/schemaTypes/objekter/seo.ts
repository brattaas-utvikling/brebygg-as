import { defineType, defineField } from "sanity";

export const seo = defineType({
  name:  "seo",
  title: "Søkemotoroptimalisering",
  type:  "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: "tittel", title: "Sidetittel", type: "string",
      description: "Vises i Google og i fanen. Maks 60 tegn, ellers kuttes den.",
      validation: (r) => r.max(60).warning("Over 60 tegn blir kuttet i søkeresultatet."),
    }),
    defineField({
      name: "beskrivelse", title: "Metabeskrivelse", type: "text", rows: 3,
      description: "Sammendraget under tittelen i Google. Maks 160 tegn.",
      validation: (r) => r.max(160).warning("Over 160 tegn blir kuttet."),
    }),
    defineField({
      name: "ogBilde", title: "Delingsbilde", type: "image",
      description: "Vises når siden deles på Facebook, LinkedIn eller i meldinger. 1200×630 px.",
    }),
    defineField({
      name: "skjulFraSok", title: "Skjul fra søkemotorer", type: "boolean",
      description: "Setter noindex. Kun på sider som ikke skal finnes i Google.",
      initialValue: false,
    }),
  ],
});
