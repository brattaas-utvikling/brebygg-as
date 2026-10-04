// src/scripts/karusell.ts
//
// Felles oppførsel for alle .karusell på siden: dra med mus, piler og
// fremdriftslinje. Touch og tastatur (piltaster når regionen har fokus) er
// nettleserens egen scroll.
//
// Brukes av ProsjektKarusell og SisteNyttBlokk. Astro pakker modulen én gang
// per side selv om begge importerer den, så hver karusell kobles opp én gang.
//
// Markup som forventes:
//   .karusell > .karusell__track > .karusell__item
//   rett etter .karusell: [data-karusell-kontroller] med [data-tommel] og
//   knapper med data-retning="-1" / "1"

const reduserBevegelse = window.matchMedia("(prefers-reduced-motion: reduce)");

document.querySelectorAll<HTMLElement>(".karusell").forEach((el) => {
  const track = el.querySelector<HTMLElement>(".karusell__track");
  if (!track) return;

  const kontroller = el.nextElementSibling instanceof HTMLElement &&
    el.nextElementSibling.matches("[data-karusell-kontroller]")
      ? el.nextElementSibling
      : null;
  const tommel = kontroller?.querySelector<HTMLElement>("[data-tommel]") ?? null;
  const forrige = kontroller?.querySelector<HTMLButtonElement>('[data-retning="-1"]') ?? null;
  const neste = kontroller?.querySelector<HTMLButtonElement>('[data-retning="1"]') ?? null;

  /** Ett kort pluss mellomrommet — avstanden mellom to snappunkter. */
  const steg = () => {
    const kort = track.querySelector<HTMLElement>(".karusell__item");
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return (kort?.offsetWidth ?? el.clientWidth) + gap;
  };

  // ── Piler og fremdrift ────────────────────────────────────────────
  let planlagt = false;
  const oppdater = () => {
    planlagt = false;
    const maks = el.scrollWidth - el.clientWidth;
    const kanBla = maks > 2;
    if (kontroller) kontroller.hidden = !kanBla;
    if (!kanBla) return;

    const andel = el.clientWidth / el.scrollWidth;
    const posisjon = Math.min(1, Math.max(0, el.scrollLeft / maks));
    if (tommel) {
      tommel.style.width = `${andel * 100}%`;
      tommel.style.left = `${posisjon * (1 - andel) * 100}%`;
    }
    // aria-disabled og ikke disabled: en knapp med fokus som blir disabled,
    // mister fokus, og tastaturbrukeren havner øverst på siden.
    forrige?.setAttribute("aria-disabled", String(el.scrollLeft <= 2));
    neste?.setAttribute("aria-disabled", String(el.scrollLeft >= maks - 2));
  };
  const planlegg = () => {
    if (planlagt) return;
    planlagt = true;
    requestAnimationFrame(oppdater);
  };
  el.addEventListener("scroll", planlegg, { passive: true });
  new ResizeObserver(planlegg).observe(el);
  oppdater();

  [forrige, neste].forEach((knapp) =>
    knapp?.addEventListener("click", () => {
      if (knapp.getAttribute("aria-disabled") === "true") return;
      el.scrollBy({
        left: Number(knapp.dataset.retning) * steg(),
        behavior: reduserBevegelse.matches ? "auto" : "smooth",
      });
    }),
  );

  // ── Dra med mus ───────────────────────────────────────────────────
  let nede = false;
  let dratt = false;
  let startX = 0;
  let startScroll = 0;

  el.addEventListener("pointerdown", (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    nede = true;
    dratt = false;
    startX = e.clientX;
    startScroll = el.scrollLeft;
  });

  el.addEventListener("pointermove", (e: PointerEvent) => {
    if (!nede) return;
    const dx = e.clientX - startX;
    // Terskel, så et vanlig klikk på et kort ikke tolkes som drag.
    if (!dratt && Math.abs(dx) < 5) return;
    if (!dratt) {
      dratt = true;
      // is-dragging slår av scroll-snap. Med snap på hopper karusellen til
      // nærmeste kort for hver pikselbevegelse, og draget føles hakkete.
      el.classList.add("is-dragging");
    }
    e.preventDefault();
    el.scrollLeft = startScroll - dx;
  });

  const slipp = () => {
    if (!nede) return;
    nede = false;
    if (!dratt) return;

    // Gli til nærmeste kort mens snap fortsatt er av, og slå det på igjen
    // når bevegelsen er ferdig.
    const s = steg();
    el.scrollTo({
      left: Math.round(el.scrollLeft / s) * s,
      behavior: reduserBevegelse.matches ? "auto" : "smooth",
    });
    let ferdig = false;
    const avslutt = () => {
      if (ferdig) return;
      ferdig = true;
      el.classList.remove("is-dragging");
    };
    el.addEventListener("scrollend", avslutt, { once: true });
    window.setTimeout(avslutt, 600);
  };
  document.addEventListener("pointerup", slipp);
  document.addEventListener("pointercancel", slipp);

  // Et drag skal ikke åpne prosjektet musa tilfeldigvis slippes over.
  el.addEventListener(
    "click",
    (e) => {
      if (!dratt) return;
      e.preventDefault();
      e.stopPropagation();
      dratt = false;
    },
    true,
  );

  // Nettleserens egen dra-og-slipp av bilder og lenker kaprer ellers draget.
  el.addEventListener("dragstart", (e) => e.preventDefault());
});

// Gjør filen til en modul, så navnene over ikke blir globale.
export {};
