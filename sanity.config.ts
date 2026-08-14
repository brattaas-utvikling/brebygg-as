// sanity.config.ts
// Sanity Studio, montert på /studio via @sanity/astro.
//
// projectId og dataset leses fra .env — de skal ikke stå i kildekoden.
// Se .env.example.

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemaTypes";
import { structure, singletonActions, singletonTypes } from "./sanity/desk/structure";

// Studio kjøres av Vite, så import.meta.env er tilgjengelig her.
// process.env-fallbacken er for `sanity dev` og `sanity deploy`, som kjører
// utenfor Astro.
const projectId =
  import.meta.env?.PUBLIC_SANITY_PROJECT_ID ?? process.env.PUBLIC_SANITY_PROJECT_ID ?? "";
const dataset =
  import.meta.env?.PUBLIC_SANITY_DATASET ?? process.env.PUBLIC_SANITY_DATASET ?? "production";

export default defineConfig({
  name:    "brebygg",
  title:   "BRE Bygg",
  basePath: "/studio",
  projectId,
  dataset,

  plugins: [structureTool({ structure }), visionTool()],

  schema: {
    types: schemaTypes,
    // Fjerner singletons fra «opprett nytt»-menyen, så det ikke kan lages to
    // forsider eller to innstillingsdokumenter.
    templates: (prev) => prev.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },

  document: {
    // Skjuler «dupliser» og «slett» på singletons.
    actions: (prev, { schemaType }) =>
      singletonTypes.has(schemaType)
        ? prev.filter(({ action }) => action && singletonActions.has(action))
        : prev,
  },
});
