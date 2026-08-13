// src/pages/llms.txt.ts
// Genererer /llms.txt fra samme kilde som JSON-LD.
//
// v1 hadde en håndskrevet public/llms.txt som allerede hadde driftet fra koden:
// den oppga 15–20 ansatte (reelt 3) og post@brebygg.no (reelt kontakt@). Det er
// nøyaktig den filen AI-crawlere leser som fasit om selskapet, så avviket var
// den dyreste av de tre NAP-feilene.
//
// Regelen som gjør at det ikke kan skje igjen: denne filen importerer kun fra
// FAKTA_BEKREFTET. Ubekreftede påstander finnes ikke i scope.

import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import {
  SITE_URL, NAP, ADRESSE_EN_LINJE, AREA_SERVED, HOVEDKOMMUNER,
  OPENING_HOURS, FAKTA_BEKREFTET, TJENESTER,
} from "@config/site";
import { TEAM } from "@config/om-oss";
import { KATEGORI_LABEL } from "@/content.config";

export const GET: APIRoute = async () => {
  const prosjekter = (await getCollection("prosjekter")).sort(
    (a, b) => b.data.aar - a.data.aar
  );

  const linjer = [
    `# ${NAP.name}`,
    `> Totalentreprenør i Vestfold, Norge.`,
    ``,
    `${NAP.name} er en totalentreprenør med base i ${NAP.address.city}. Vi leverer nybygg,`,
    `rehabilitering og næringsbygg til private og næringskunder i ${HOVEDKOMMUNER.join(", ")}`,
    `og omegn. Som totalentreprenør har oppdragsgiver ett kontaktpunkt og vi har`,
    `ansvaret for prosjektering, koordinering av underentreprenører og ferdigstillelse.`,
    ``,
    `## Fakta`,
    ``,
    `- Organisasjonsnummer: ${NAP.orgNumber}`,
    `- Selskapsform: ${FAKTA_BEKREFTET.legalType}`,
    `- Ansatte: ${FAKTA_BEKREFTET.ansatte}`,
    `- Entrepriseform: ${FAKTA_BEKREFTET.entrepriseform}`,
    ``,
    `## Kontakt`,
    ``,
    `- E-post: ${NAP.email}`,
    `- Telefon: ${NAP.phoneDisplay} (${NAP.phone})`,
    `- Adresse: ${ADRESSE_EN_LINJE}, ${NAP.address.countryFull}`,
    `- Åpningstider: ${OPENING_HOURS.display}`,
    `- Ingen kontaktskjema. Henvendelser skjer per telefon eller e-post.`,
    ``,
    `## Personer`,
    ``,
    ...TEAM.map((m) =>
      `- ${m.navn}, ${m.rolle}${m.epost ? ` — ${m.epost}` : ""}${m.tlf ? `, ${m.tlf}` : ""}`
    ),
    ``,
    `## Tjenester`,
    ``,
    ...TJENESTER.map((t) => `- [${t.title}](${SITE_URL}${t.slug}): ${t.description}`),
    ``,
    `## Geografi`,
    ``,
    `- Primærmarked: ${NAP.address.region}`,
    `- Dekker: ${AREA_SERVED.join(", ")}`,
    ``,
    `## Prosjekter`,
    ``,
    ...prosjekter.map((p) =>
      `- [${p.data.title}](${SITE_URL}/prosjekter/${p.id}/): ` +
      `${KATEGORI_LABEL[p.data.kategori]}, ${p.data.location}, ${p.data.aar}. ${p.data.description}`
    ),
    ``,
    `## Sider`,
    ``,
    `- [Forside](${SITE_URL}/)`,
    `- [Om oss](${SITE_URL}/om-oss/)`,
    `- [Prosjekter](${SITE_URL}/prosjekter/)`,
    `- [Kontakt](${SITE_URL}/kontakt/)`,
    ``,
  ];

  return new Response(linjer.join("\n"), {
    headers: {
      "Content-Type":  "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
