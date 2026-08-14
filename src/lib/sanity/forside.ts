// src/lib/sanity/forside.ts
//
// Henter forsiden fra Sanity, eller gir en fallback bygget fra site.ts når
// Sanity ikke er konfigurert. Samme form på begge, så index.astro har én gren.

import { BRUKER_SANITY, sanityKlient } from "./client";
import { Q_FORSIDE } from "./queries";
import { FAQ_ITEMS, NAP } from "@config/site";

export type Seksjon = Record<string, any> & { _type: string; _key: string; tema?: string };

export type ForsideData = {
  hero: {
    tittel: string;
    ingress: string;
    bilde?: unknown;
    knapper?: { tekst: string; url: string; stil?: string }[];
  };
  seksjoner: Seksjon[];
  seo?: { tittel?: string; beskrivelse?: string; skjulFraSok?: boolean };
};

/**
 * Fallback som speiler dagens forside.
 *
 * Poenget er ikke å være en permanent kilde, men at rekkefølgen her er
 * nøyaktig den klienten skal se når hun åpner Studio første gang etter
 * migreringen — så hun kjenner igjen siden sin.
 */
function fallback(): ForsideData {
  return {
    hero: {
      tittel:  "Totalentreprenør i Vestfold",
      ingress: "BRE Bygg tar fullt ansvar for byggeprosessen — fra prosjektering til du får nøklene. Enten det er nybygg i Tønsberg, rehabilitering i Sandefjord eller næringsbygg i Larvik.",
      knapper: [
        { tekst: "Se prosjekter",           url: "/prosjekter/", stil: "primary" },
        { tekst: NAP.phoneDisplay,          url: NAP.phoneHref,  stil: "outline" },
      ],
    },
    seksjoner: [
      { _type: "tjenesterBento",   _key: "f1", tema: "mork" },
      { _type: "prosjektKarusell", _key: "f2", tema: "lys",
        overskrift: "Bygg vi har levert i Vestfold", antall: 8 },
      { _type: "faqBlokk",         _key: "f3", tema: "seksjon",
        overskrift: "Det folk lurer på",
        sporsmaal: FAQ_ITEMS.map((f) => ({ sporsmaal: f.question, svar: f.answer })) },
      { _type: "ctaBanner",        _key: "f4", tema: "mork",
        overskrift: "Skal du bygge i Vestfold?",
        tekst: "Ring for en uforpliktende befaring. Vi sier fra med én gang hvis vi ikke er riktig entreprenør for jobben.",
        knapper: [{ tekst: `Ring ${NAP.phoneDisplay}`, url: NAP.phoneHref, stil: "primary" }] },
    ],
  };
}

export async function hentForside(): Promise<ForsideData> {
  if (!BRUKER_SANITY) return fallback();

  const data = await sanityKlient().fetch<ForsideData | null>(Q_FORSIDE);

  if (!data?.hero?.tittel) {
    // I dev: advar og bruk fallbacken.
    //
    // Uten dette var oppsettet en hønen-og-egget: du må ha Studio kjørende for
    // å opprette forsiden, men dev-serveren krasjet fordi forsiden ikke fantes
    // ennå. Nå kan du starte Studio, migrere, og se resultatet uten omveier.
    if (import.meta.env.DEV) {
      console.warn(
        "\n[forside] Fant ingen publisert forside i Sanity — viser fallbacken fra koden.\n" +
        "          Kjør `npm run migrer`, eller opprett dokumentet «Forside» i /studio.\n"
      );
      return fallback();
    }

    // I produksjonsbygg: stopp.
    // Å deploye fallbacken i stillhet ville betydd at klientens redigeringer
    // ikke vises, uten at noen får vite det.
    throw new Error(
      "Fant ingen publisert forside i Sanity.\n" +
      "Opprett dokumentet «Forside» i /studio og fyll ut hero-feltene, kjør " +
      "`npm run migrer`, eller fjern PUBLIC_SANITY_PROJECT_ID for å bygge fra markdown."
    );
  }

  return { ...data, seksjoner: data.seksjoner ?? [] };
}

/**
 * Spørsmålene som faktisk vises på forsiden.
 *
 * FAQPage-schema skal kun legges ut når faqBlokk står i komposisjonen. Google
 * slår ned på strukturerte data som beskriver innhold brukeren ikke ser, og
 * med en klientkomponert forside kan vi ikke vite det på forhånd — vi må lese
 * det ut av seksjonslista.
 */
export function faqPaaSiden(seksjoner: Seksjon[]): { question: string; answer: string }[] {
  return seksjoner
    .filter((s) => s._type === "faqBlokk")
    .flatMap((s) => (Array.isArray(s.sporsmaal) ? s.sporsmaal : []))
    .map((f: { sporsmaal: string; svar: string }) => ({ question: f.sporsmaal, answer: f.svar }));
}
