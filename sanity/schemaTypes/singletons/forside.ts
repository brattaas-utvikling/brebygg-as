import { defineType, defineField, defineArrayMember } from "sanity";
import { MORKE_TEMAER } from "../../lib/tema";
import { alleBlokker } from "../blokker";

/**
 * Forsiden.
 *
 * To bevisste valg her:
 *
 * 1. Heroen er IKKE en del av seksjonslista. Hero-bildet er LCP-elementet og
 *    preloades med fetchpriority="high" fra BaseLayout, og <h1> må være første
 *    overskrift på siden. Kunne klienten flytte heroen ned eller fjerne den,
 *    ryker både LCP-optimaliseringen og overskriftshierarkiet. Alt innholdet i
 *    heroen kan endres — bare ikke at den er først.
 *
 * 2. Rytmevalideringen er en advarsel, ikke en feil. To mørke seksjoner på rad
 *    flater ut siden, men det finnes tilfeller der man vil ha det. Klienten blir
 *    gjort oppmerksom og kan velge selv.
 */
export const forside = defineType({
  name:  "forside",
  title: "Forside",
  type:  "document",
  groups: [
    { name: "hero",      title: "Hero", default: true },
    { name: "seksjoner", title: "Seksjoner" },
    { name: "seo",       title: "SEO" },
  ],
  fields: [
    defineField({
      name: "hero", title: "Hero", type: "object", group: "hero",
      description: "Alltid øverst på siden. Kan ikke flyttes — se kommentaren i skjemaet.",
      fields: [
        defineField({
          name: "tittel", title: "Tittel", type: "string",
          description: "Blir sidens <h1>. Én per side.",
          validation: (r) => r.required().max(70),
        }),
        defineField({
          name: "ingress", title: "Ingress", type: "text", rows: 4,
          description: "Slå fast hva BRE Bygg gjør, for hvem og hvor — i første setning.",
          validation: (r) => r.required(),
        }),
        defineField({
          name: "bilde", title: "Bakgrunnsbilde", type: "bilde",
          description: "Et mørkt scrim legges automatisk over venstre del så teksten holder WCAG AA uansett hvilket bilde du velger.",
          validation: (r) => r.required(),
        }),
        defineField({ name: "knapper", title: "Knapper", type: "array", of: [{ type: "cta" }], validation: (r) => r.max(2) }),
      ],
    }),

    defineField({
      name: "seksjoner", title: "Seksjoner", type: "array", group: "seksjoner",
      description: "Dra for å endre rekkefølge. Veksle mellom lyse og mørke bakgrunner — det er vekslingen som gir siden rytme.",
      of: alleBlokker.map((b) => defineArrayMember({ type: b.name })),
      validation: (Rule) =>
        Rule.custom((seksjoner) => {
          if (!Array.isArray(seksjoner)) return true;
          const temaer = seksjoner.map((s) => (s as { tema?: string })?.tema ?? "lys");
          for (let i = 1; i < temaer.length; i++) {
            const forrige = temaer[i - 1] as string;
            const naa     = temaer[i] as string;
            if (MORKE_TEMAER.includes(forrige as never) && MORKE_TEMAER.includes(naa as never)) {
              return `Seksjon ${i} og ${i + 1} har begge mørk bakgrunn. To mørke på rad flyter sammen — vurder en lys imellom.`;
            }
          }
          return true;
        }).warning(),
    }),

    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Forside" }) },
});
