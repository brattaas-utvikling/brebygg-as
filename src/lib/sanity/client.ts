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
    useCdn:     false,
    ...(SANITY_TOKEN ? { token: SANITY_TOKEN, perspective: "published" as const } : {}),
  });
  return klient;
}
