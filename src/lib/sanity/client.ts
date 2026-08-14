// src/lib/sanity/client.ts
//
// Klient for byggetid. Aldri i nettleseren: output er "static", så all henting
// skjer under bygg og tokenet forlater aldri byggemaskinen.

import { createClient, type SanityClient } from "@sanity/client";

export const SANITY_PROJECT_ID = import.meta.env.PUBLIC_SANITY_PROJECT_ID ?? "";
export const SANITY_DATASET    = import.meta.env.PUBLIC_SANITY_DATASET    ?? "production";
const SANITY_TOKEN             = import.meta.env.SANITY_API_READ_TOKEN    ?? "";

/**
 * Kildebryteren.
 *
 * Uten projectId faller bygget tilbake til markdown-filene i src/content/.
 * Begge kilder mates gjennom samme Zod-skjema, så komponentene er identiske.
 *
 * Dette er en migreringsbro og skal fjernes når innholdet er flyttet: se
 * MIGRERING.md. Å la to kilder ligge permanent er en vedlikeholdsfelle.
 */
export const BRUKER_SANITY = SANITY_PROJECT_ID.length > 0;

let klient: SanityClient | null = null;

export function sanityKlient(): SanityClient {
  if (!BRUKER_SANITY) {
    throw new Error(
      "PUBLIC_SANITY_PROJECT_ID mangler. Sett den i .env, eller la den stå tom " +
      "for å bygge fra markdown-filene i src/content/."
    );
  }
  klient ??= createClient({
    projectId:  SANITY_PROJECT_ID,
    dataset:    SANITY_DATASET,
    apiVersion: "2026-08-01",

    // CDN av ved bygg: vi vil ha nyeste innhold umiddelbart etter publisering,
    // ikke det som lå i kanten for fem minutter siden.
    useCdn: false,

    // ALLTID published, uavhengig av token.
    //
    // Dette sto tidligere inne i token-betingelsen, og det ga en feil som bare
    // viste seg i produksjon: for apiVersion fra 2025 og senere er API-ets
    // standardperspektiv `drafts`. Uten token er utkast ikke lesbare, så
    // spørringen returnerte tomt i stedet for å feile.
    //
    // Lokalt fantes tokenet og alt virket. På Vercel gjorde det ikke, og
    // bygget deployet et nettsted uten prosjekter og tjenester — grønt.
    perspective: "published",

    // Kun nødvendig for private datasett, eller for å lese utkast i
    // forhåndsvisning. Skal ikke være påkrevd for et vanlig bygg.
    ...(SANITY_TOKEN ? { token: SANITY_TOKEN } : {}),
  });
  return klient;
}
