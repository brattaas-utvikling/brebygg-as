// sanity/desk/structure.ts
// Desk-strukturen speiler nettstedet, ikke databasen.
//
// Klienten skal kjenne igjen navigasjonen fra sin egen side. En flat liste over
// dokumenttyper er riktig for en utvikler og feil for en redaktør.
//
// Øverst ligger «Sider» i samme rekkefølge som menyen på nettstedet. Hver side
// er en singleton: teksten og bildene på selve siden. Innholdet sidene viser
// (tjenester, prosjekter, personer) ligger under, fordi det lever sitt eget
// liv — et prosjekt vises både på forsiden, i prosjektlista og på en
// tjenesteside.
//
// Singletons låses til ett dokument — ingen «opprett ny forside»-knapp.

import type { StructureResolver } from "sanity/structure";
import { SINGLETONS } from "../schemaTypes";

const singleton = (S: Parameters<StructureResolver>[0], type: string, tittel: string) =>
  S.listItem()
    .title(tittel)
    .id(type)
    .child(S.document().schemaType(type).documentId(type).title(tittel));

export const structure: StructureResolver = (S) =>
  S.list()
    .title("BRE Bygg")
    .items([
      S.listItem()
        .title("Sider")
        .id("sider")
        .child(
          S.list()
            .title("Sider")
            .items([
              singleton(S, "forside",        "Forside"),
              singleton(S, "tjenesterSide",  "Tjenester"),
              singleton(S, "prosjekterSide", "Prosjekter"),
              singleton(S, "omOssSide",      "Om oss"),
              singleton(S, "baerekraftSide", "Bærekraft"),
              singleton(S, "kontaktSide",    "Kontakt"),
            ])
        ),
      S.divider(),

      S.listItem()
        .title("Tjenester")
        .child(S.documentTypeList("tjeneste").title("Tjenester").defaultOrdering([{ field: "sortering", direction: "asc" }])),

      S.listItem()
        .title("Prosjekter")
        .child(
          S.list()
            .title("Prosjekter")
            .items([
              S.listItem().title("Alle prosjekter")
                .child(S.documentTypeList("prosjekt").title("Alle prosjekter").defaultOrdering([{ field: "aar", direction: "desc" }])),
              S.listItem().title("Pågående")
                .child(S.documentList().title("Pågående").filter('_type == "prosjekt" && status == "pagaende"')),
              S.listItem().title("Fremhevet på forsiden")
                .child(S.documentList().title("Fremhevet").filter('_type == "prosjekt" && fremhevet == true')),
              S.divider(),
              ...["nybygg", "rehabilitering"].map((k) =>
                S.listItem().title(k[0]!.toUpperCase() + k.slice(1))
                  .child(S.documentList().title(k).filter('_type == "prosjekt" && kategori == $k').params({ k }))
              ),
            ])
        ),

      S.listItem()
        .title("Siste nytt")
        .child(S.documentTypeList("nyhet").title("Siste nytt").defaultOrdering([{ field: "dato", direction: "desc" }])),

      S.listItem()
        .title("Personer")
        .child(S.documentTypeList("teamMedlem").title("Personer").defaultOrdering([{ field: "sortering", direction: "asc" }])),

      // «Meny» er fortsatt bevisst ikke redigerbar.
      //
      // Menyen speiler sidestrukturen og lenker til sider som finnes i koden.
      // Et menypunkt til en side som ikke finnes, gir 404. Header og Footer
      // henter fra src/config/navigation.ts.

      S.divider(),
      singleton(S, "nettstedInnstillinger", "Innstillinger"),
    ]);

/** Skjuler singletons fra «opprett nytt»-menyen. */
export const singletonActions = new Set(["publish", "discardChanges", "restore"]);
export const singletonTypes = new Set<string>(SINGLETONS);
