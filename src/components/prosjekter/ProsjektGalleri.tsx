// src/components/prosjekter/ProsjektGalleri.tsx
// React island — hydratiseres client:visible.
//
// Ansvar:
//   - Filterlogikk (kategori-tabs)
//   - URL-sync via URLSearchParams (bokmerke-støtte)
//   - Animasjon av kort ved filterbytte
//   - Tilgjengelighet: aria-pressed, aria-live, role="status"
//
// Data:
//   All prosjektdata er serialisert og sendt som props fra Astro
//   på byggetidspunkt — ingen runtime-fetching.

import { useState, useEffect, useId, useRef } from "react";
import { cn } from "@lib/utils/cn";

// --------------------------------------------------------------------------
// Typer
// --------------------------------------------------------------------------

export type ProsjektKortData = {
  slug:        string;
  title:       string;
  description: string;
  location:    string;
  kategori:    "nybygg" | "rehabilitering" | "naeringsbygg";
  status:      "ferdig" | "pagaende";
  aar:         number;
  heroImage:   { src: string; alt: string; width?: number; height?: number };
  fremhevet:   boolean;
};

type KategoriOption = {
  id:    string;
  label: string;
};

type KategoriId = "alle" | ProsjektKortData["kategori"];

type Props = {
  prosjekter:  ProsjektKortData[];
  kategorier:  readonly KategoriOption[];
};

// --------------------------------------------------------------------------
// Hjelper: kategori-etikett
// --------------------------------------------------------------------------

const KATEGORI_LABEL: Record<ProsjektKortData["kategori"], string> = {
  nybygg:         "Nybygg",
  rehabilitering: "Rehabilitering",
  naeringsbygg:   "Næringsbygg",
};

// --------------------------------------------------------------------------
// Hjelper: les filter fra URL
// --------------------------------------------------------------------------

function filterFraUrl(kategorier: readonly KategoriOption[]): KategoriId {
  if (typeof window === "undefined") return "alle";
  const params = new URLSearchParams(window.location.search);
  const raw    = params.get("kategori");
  if (raw && kategorier.some(k => k.id === raw)) {
    return raw as KategoriId;
  }
  return "alle";
}

// --------------------------------------------------------------------------
// ProsjektKort (underkomponent)
// --------------------------------------------------------------------------

function ProsjektKort({
  prosjekt,
  animationDelay = 0,
}: {
  prosjekt:       ProsjektKortData;
  animationDelay: number;
}) {
  const erPågående = prosjekt.status === "pagaende";

  return (
    <a
      href={`/prosjekter/${prosjekt.slug}/`}
      className="prosjekt-card galleri-kort-enter"
      style={{ animationDelay: `${animationDelay}ms` }}
      aria-label={`${prosjekt.title}, ${KATEGORI_LABEL[prosjekt.kategori]}, ${prosjekt.location}, ${prosjekt.aar}`}
    >
      {/* Bilde */}
      <div className="prosjekt-card__img">
        <img
          src={prosjekt.heroImage.src}
          alt={prosjekt.heroImage.alt}
          loading="lazy"
          decoding="async"
          width={prosjekt.heroImage.width  ?? 800}
          height={prosjekt.heroImage.height ?? 500}
        />
      </div>

      {/* Kortinnhold */}
      <div className="prosjekt-card__body">

        {/* Pågående-merke — over kategoritag */}
        {erPågående && (
          <div className="prosjekt-card__pågående" aria-label="Pågående prosjekt">
            Pågående
          </div>
        )}

        {/* Kategoritag */}
        <span className="prosjekt-card__tag">
          {KATEGORI_LABEL[prosjekt.kategori]}
        </span>

        {/* Tittel */}
        <h2 className="prosjekt-card__title">{prosjekt.title}</h2>

        {/* Ingress */}
        <p className="prosjekt-card__desc">
          {prosjekt.description}
        </p>

        {/* Meta: sted · år */}
        <p className="prosjekt-card__meta">
          <svg
            width="11" height="11"
            viewBox="0 0 11 11"
            fill="none"
            aria-hidden="true"
            style={{ flexShrink: 0 }}
          >
            <path
              d="M5.5 0C3.57 0 2 1.57 2 3.5 2 6.13 5.5 11 5.5 11S9 6.13 9 3.5C9 1.57 7.43 0 5.5 0Zm0 4.75c-.69 0-1.25-.56-1.25-1.25S4.81 2.25 5.5 2.25s1.25.56 1.25 1.25-.56 1.25-1.25 1.25Z"
              fill="currentColor"
            />
          </svg>
          {prosjekt.location}
          <span aria-hidden="true">·</span>
          {prosjekt.aar}
        </p>

      </div>
    </a>
  );
}

// --------------------------------------------------------------------------
// Filterknapp
// --------------------------------------------------------------------------

function FilterKnapp({
  label,
  aktiv,
  onClick,
  count,
}: {
  label:   string;
  aktiv:   boolean;
  onClick: () => void;
  count?:  number;
}) {
  return (
    <button
      type="button"
      className={cn("filter-btn", aktiv && "filter-btn--aktiv")}
      aria-pressed={aktiv}
      onClick={onClick}
    >
      {label}
      {count !== undefined && (
        <span
          className={cn(
            "filter-btn__count",
            aktiv ? "filter-btn__count--aktiv" : ""
          )}
          aria-label={`(${count} prosjekter)`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// --------------------------------------------------------------------------
// Hovedkomponent
// --------------------------------------------------------------------------

export default function ProsjektGalleri({ prosjekter, kategorier }: Props) {
  // Initialiser fra URL — unngår flash av feil filter
  const [aktivFilter, setAktivFilter] = useState<KategoriId>("alle");
  const [filterNøkkel, setFilterNøkkel] = useState(0); // Trigger re-animasjon
  const tellerId = useId();
  const isFirstMount = useRef(true);

  // Les filter fra URL på mount (kun klient)
  useEffect(() => {
    const fraUrl = filterFraUrl(kategorier);
    setAktivFilter(fraUrl);
    isFirstMount.current = false;
  }, [kategorier]);

  // Oppdater URL og trigger animasjon ved filterbytte
  function velgFilter(id: KategoriId) {
    setAktivFilter(id);
    setFilterNøkkel(n => n + 1); // Re-mounter grid → re-trigger animasjoner

    // Oppdater URL uten reload
    const url = new URL(window.location.href);
    if (id === "alle") {
      url.searchParams.delete("kategori");
    } else {
      url.searchParams.set("kategori", id);
    }
    window.history.replaceState({}, "", url.toString());
  }

  // Beregn antall per kategori (for teller på filterknappene)
  function antall(id: string): number {
    if (id === "alle") return prosjekter.length;
    return prosjekter.filter(p => p.kategori === id).length;
  }

  // Filtrer prosjekter
  const filtrerte: ProsjektKortData[] =
    aktivFilter === "alle"
      ? prosjekter
      : prosjekter.filter(p => p.kategori === aktivFilter);

  // Antall resultat-tekst
  const tellerTekst =
    aktivFilter === "alle"
      ? `Viser alle ${filtrerte.length} prosjekter`
      : `${filtrerte.length} ${filtrerte.length === 1 ? "prosjekt" : "prosjekter"} — ${
          kategorier.find(k => k.id === aktivFilter)?.label ?? aktivFilter
        }`;

  return (
    <section
      className="section"
      style={{ backgroundColor: "var(--color-bg)" }}
      aria-labelledby="galleri-heading"
    >
      <div className="container">

        {/* Seksjonstittel + filter i én rad */}
        <div className="galleri-toprad">
          <h2 className="section-title" id="galleri-heading">
            Prosjekter i Vestfold
          </h2>

          {/* Filterknapper */}
          <div
            className="filter-bar"
            role="group"
            aria-label="Filtrer prosjekter etter kategori"
          >
            {kategorier.map(k => (
              <FilterKnapp
                key={k.id}
                label={k.label}
                aktiv={aktivFilter === k.id}
                onClick={() => velgFilter(k.id as KategoriId)}
                count={antall(k.id)}
              />
            ))}
          </div>
        </div>

        {/* Live-region: skjermlesere annonserer antall endringer */}
        <p
          id={tellerId}
          className="galleri-teller"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {tellerTekst}
        </p>

        {/* Gallerigrid
            key={filterNøkkel}: tvinger React til å remounte grid ved filterbytte
            slik at .galleri-kort-enter-animasjoner kjøres på nytt */}
        {filtrerte.length > 0 ? (
          <div
            key={filterNøkkel}
            className="galleri-grid"
            role="list"
            aria-label="Prosjekter"
          >
            {filtrerte.map((p, i) => (
              <div key={p.slug} role="listitem">
                <ProsjektKort
                  prosjekt={p}
                  animationDelay={Math.min(i, 8) * 40} // maks 320ms totalt
                />
              </div>
            ))}
          </div>
        ) : (
          /* Tom tilstand */
          <div className="galleri-tom" role="status">
            <p>
              Ingen prosjekter i denne kategorien ennå.
            </p>
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => velgFilter("alle")}
            >
              Vis alle prosjekter
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
