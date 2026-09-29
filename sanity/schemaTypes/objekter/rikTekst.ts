import { defineArrayMember } from "sanity";

/**
 * Blokkdefinisjonen for all rik tekst i Studio.
 *
 * Standardblokken i Sanity tilbyr H1–H6. H1 tilhører sidens hero, og en ekstra
 * <h1> i brødteksten svekker overskriftshierarkiet for skjermlesere og søk.
 * H4–H6 gir ingen synlig forskjell på korte tekster og blir bare støy i
 * nedtrekkslista. RikTekst.astro gjør likevel om h1 til h2 for innhold som
 * ble lagt inn før denne begrensningen.
 *
 * En funksjon og ikke en delt konstant: Sanity muterer feltdefinisjoner
 * internt, og samme objekt gjenbrukt på flere felt ville koblet dem sammen.
 */
export const rikTekstBlokker = () => [
  defineArrayMember({
    type: "block",
    styles: [
      { title: "Normal",        value: "normal" },
      { title: "Overskrift",    value: "h2" },
      { title: "Underoverskrift", value: "h3" },
      { title: "Sitat",         value: "blockquote" },
    ],
    lists: [
      { title: "Punktliste",  value: "bullet" },
      { title: "Nummerert",   value: "number" },
    ],
  }),
];
