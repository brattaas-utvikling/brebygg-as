// src/lib/sanity/loaders.ts
//
// Content Layer-loadere som henter fra Sanity ved bygg.
//
// Loaderne mater samme Zod-skjemaer som glob()-loaderne gjør i dag. Det er
// hele poenget: `getCollection("prosjekter")` returnerer identisk typet data
// uansett hvilken kilde som er aktiv, så ingen komponent trenger å vite noe om
// Sanity.

import type { Loader } from "astro/loaders";
import { sanityKlient } from "./client";
import { Q_PROSJEKTER, Q_TJENESTER } from "./queries";

type Rad = Record<string, unknown> & { id?: string };

/**
 * Generisk loader.
 *
 * store.clear() før innlasting: uten det ville slettede dokumenter blitt
 * liggende igjen i cachen mellom bygg, og en side vi trodde var borte ville
 * fortsatt bli generert.
 */
function sanityLoader(navn: string, query: string): Loader {
  return {
    name: `sanity-${navn}`,
    load: async ({ store, parseData, logger, generateDigest }) => {
      logger.info(`Henter ${navn} fra Sanity…`);
      const rader = await sanityKlient().fetch<Rad[]>(query);

      // Null dokumenter er alltid feil når Sanity er konfigurert.
      //
      // Uten dette rapporterte bygget «Complete!» med 7 sider i stedet for 16,
      // og deployet et nettsted uten prosjekter og tjenester. Astro logger en
      // advarsel om tomme collections, men lar bygget passere.
      //
      // Et tomt datasett er en feilkonfigurasjon. Et datasett som ikke er tomt
      // og likevel svarer tomt, er et tilgangs- eller perspektivproblem.
      // Begge skal stoppe deployen, ikke gå ut som grønt.
      if (rader.length === 0) {
        throw new Error(
          `Sanity returnerte 0 ${navn}.\n\n` +
          `Sjekk i rekkefølge:\n` +
          `  1. Er dokumentene PUBLISERT i Studio, ikke bare lagret som utkast?\n` +
          `  2. Stemmer PUBLIC_SANITY_DATASET? Den skal være datasettnavnet ` +
          `(f.eks. "production"), ikke projectId.\n` +
          `  3. Er datasettet privat? Da kreves SANITY_API_READ_TOKEN, også i Vercel.\n\n` +
          `Verifiser med:  npm run sjekk:sanity`
        );
      }

      store.clear();

      for (const rad of rader) {
        const id = rad.id;
        if (typeof id !== "string" || id.length === 0) {
          logger.warn(`Hopper over ${navn}-dokument uten slug: ${JSON.stringify(rad).slice(0, 80)}`);
          continue;
        }
        const data = await parseData({ id, data: rad });
        store.set({ id, data, digest: generateDigest(data) });
      }

      logger.info(`${rader.length} ${navn} hentet.`);
    },
  };
}

export const prosjekterLoader = () => sanityLoader("prosjekter", Q_PROSJEKTER);
export const tjenesterLoader  = () => sanityLoader("tjenester",  Q_TJENESTER);
