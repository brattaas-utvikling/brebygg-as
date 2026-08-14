import { defineType, defineField } from "sanity";

/**
 * Én kilde til NAP, fakta og kontaktinfo.
 *
 * Alt her går inn i tre ting samtidig: synlig tekst, JSON-LD og /llms.txt.
 * I v1 lå de samme opplysningene tre steder i koden og hadde allerede driftet
 * fra hverandre — llms.txt oppga 15–20 ansatte mot kodens 3, og en e-post som
 * ikke fantes noe annet sted. Med ett dokument kan det ikke gjenta seg.
 */
export const nettstedInnstillinger = defineType({
  name:  "nettstedInnstillinger",
  title: "Innstillinger",
  type:  "document",
  groups: [
    { name: "generelt", title: "Generelt", default: true },
    { name: "kontakt",  title: "Kontakt" },
    { name: "fakta",    title: "Fakta" },
    { name: "sosialt",  title: "Sosiale medier" },
  ],
  fields: [
    defineField({ name: "navn", title: "Selskapsnavn", type: "string", group: "generelt", validation: (r) => r.required() }),
    defineField({ name: "orgnummer", title: "Organisasjonsnummer", type: "string", group: "generelt", validation: (r) => r.required() }),
    defineField({
      name: "logo", title: "Logo", type: "image", group: "generelt",
      description: "Helst SVG med ekte vektorgrafikk, ikke et innbygget rasterbilde.",
    }),
    defineField({
      name: "standardOgBilde", title: "Standard delingsbilde", type: "image", group: "generelt",
      description: "Brukes når en side ikke har sitt eget. 1200×630 px.",
    }),

    defineField({
      name: "telefon", title: "Telefon (E.164)", type: "string", group: "kontakt",
      description: "Formatet schema.org krever: +4745222385, uten mellomrom.",
      validation: (r) => r.required().regex(/^\+\d{8,15}$/, { name: "E.164" }),
    }),
    defineField({
      name: "telefonVisning", title: "Telefon (visning)", type: "string", group: "kontakt",
      description: "Slik nummeret vises på siden: 452 22 385",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "epost", title: "E-post", type: "string", group: "kontakt",
      description: "Selskapets adresse, ikke en personlig. En sitering som peker på en person brekker den dagen personen bytter rolle.",
      validation: (r) => r.required().email(),
    }),
    defineField({
      name: "adresse", title: "Besøksadresse", type: "object", group: "kontakt",
      fields: [
        defineField({ name: "gate",    title: "Gateadresse", type: "string", validation: (r) => r.required() }),
        defineField({ name: "postnr",  title: "Postnummer",  type: "string", validation: (r) => r.required() }),
        defineField({ name: "sted",    title: "Poststed",    type: "string", validation: (r) => r.required() }),
        defineField({ name: "region",  title: "Fylke",       type: "string", initialValue: "Vestfold" }),
      ],
    }),
    defineField({
      name: "geo", title: "Koordinater", type: "object", group: "kontakt",
      description: "Hent fra Google Maps: høyreklikk på riktig punkt → klikk koordinatene for å kopiere. Feil koordinater svekker lokal synlighet direkte.",
      fields: [
        defineField({ name: "lat", title: "Breddegrad", type: "number", validation: (r) => r.required().min(-90).max(90) }),
        defineField({ name: "lng", title: "Lengdegrad", type: "number", validation: (r) => r.required().min(-180).max(180) }),
      ],
    }),
    defineField({
      name: "aapningstider", title: "Åpningstider (visning)", type: "string", group: "kontakt",
      initialValue: "Man–fre: 07:00–16:00",
    }),
    defineField({
      name: "omraader", title: "Områder vi dekker", type: "array", of: [{ type: "string" }], group: "kontakt",
      description: "Går inn i areaServed i JSON-LD og i llms.txt. Konkrete kommuner, ikke «hele Østlandet».",
      options: { layout: "tags" },
    }),
    defineField({
      name: "hovedkommuner", title: "Hovedkommuner", type: "array", of: [{ type: "string" }], group: "kontakt",
      description: "De fire–fem som nevnes i løpende tekst.",
      options: { layout: "tags" },
      validation: (r) => r.max(6),
    }),

    defineField({
      name: "antallAnsatte", title: "Antall ansatte", type: "number", group: "fakta",
      validation: (r) => r.required().integer().positive(),
    }),
    defineField({
      name: "stiftetAar", title: "Stiftet år", type: "number", group: "fakta",
      description: "La stå tom til tallet er bekreftet mot Brønnøysund. Et ubekreftet tall her går rett inn i JSON-LD.",
    }),
    defineField({
      name: "sertifiseringer", title: "Godkjenninger", type: "array", group: "fakta",
      description: "Mesterbrev, sentral godkjenning og lærebedrift er lovregulerte påstander i Norge. Legg dem kun inn når de er verifisert i registeret hos DiBK.",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "navn", title: "Navn", type: "string" }),
          defineField({ name: "info", title: "Detalj", type: "string" }),
        ],
      }],
    }),

    defineField({ name: "facebook",  title: "Facebook",  type: "url", group: "sosialt" }),
    defineField({ name: "instagram", title: "Instagram", type: "url", group: "sosialt" }),
    defineField({ name: "linkedin",  title: "LinkedIn",  type: "url", group: "sosialt" }),
  ],
  preview: { prepare: () => ({ title: "Innstillinger" }) },
});
