import { defineType, defineField } from "sanity";

/**
 * Bilde med påkrevd alt-tekst.
 *
 * Rule.required() på alt gjør det strukturelt umulig å publisere et bilde uten
 * alternativ tekst. Billigere å håndheve her enn å oppdage i en revisjon.
 */
export const bilde = defineType({
  name:    "bilde",
  title:   "Bilde",
  type:    "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt", title: "Alt-tekst", type: "string",
      description: "Beskriv hva bildet viser. «Nybygg under oppføring i Tønsberg», ikke «bilde1».",
      validation: (r) => r.required().min(5).error("Alt-tekst er påkrevd."),
    }),
    defineField({ name: "bildetekst", title: "Bildetekst", type: "string", description: "Valgfri tekst under bildet." }),
  ],
  preview: { select: { imageUrl: "asset.url", title: "alt" } },
});
