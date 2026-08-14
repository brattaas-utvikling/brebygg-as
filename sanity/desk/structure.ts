// sanity/desk/structure.ts
// Desk-strukturen speiler nettstedet, ikke databasen.
//
// Klienten skal kjenne igjen navigasjonen fra sin egen side. En flat liste over
// dokumenttyper er riktig for en utvikler og feil for en redaktør.
//
// Singletons låses til ett dokument — ingen «opprett ny forside»-knapp.

import type { StructureResolver } from "sanity/structure";
import { SINGLETONS } from "../schemaTypes";

const singleton = (S: Parameters<StructureResolver>[0], type: string, tittel: string, ikon?: string) =>
  S.listItem()
    .title(tittel)
    .id(type)
    .child(S.document().schemaType(type).documentId(type).title(tittel));

export const structure: StructureResolver = (S) =>
  S.list()
    .title("BRE Bygg")
    .items([
      singleton(S, "forside", "Forside"),
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
              ...["nybygg", "rehabilitering", "naeringsbygg"].map((k) =>
                S.listItem().title(k === "naeringsbygg" ? "Næringsbygg" : k[0]!.toUpperCase() + k.slice(1))
                  .child(S.documentList().title(k).filter('_type == "prosjekt" && kategori == $k').params({ k }))
              ),
            ])
        ),

      S.listItem().title("Personer").child(S.documentTypeList("teamMedlem").title("Personer")),
      S.listItem().title("Sider").child(S.documentTypeList("side").title("Sider")),

      S.divider(),
      singleton(S, "navigasjon", "Meny"),
      singleton(S, "nettstedInnstillinger", "Innstillinger"),
    ]);

/** Skjuler singletons fra «opprett nytt»-menyen. */
export const singletonActions = new Set(["publish", "discardChanges", "restore"]);
export const singletonTypes = new Set<string>(SINGLETONS);
