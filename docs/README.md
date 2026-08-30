# docs/

## designprofil.html → BRE-Bygg-designprofil.pdf

Kundevendt designprofil: paletten med navn, skriften, og begrunnelsen bak
valgene — blant annet hvorfor teksten i menyen er nesten svart.

Kilden er HTML slik at den kan oppdateres når designet endres. Verdiene i
dokumentet skal stemme med `src/styles/globals.css`; endrer du en farge der,
oppdater kortet her også.

Regenerer PDF-en:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --no-pdf-header-footer \
  --print-to-pdf=docs/BRE-Bygg-designprofil.pdf \
  "file://$PWD/docs/designprofil.html"
```

`--no-pdf-header-footer` er nødvendig, ellers trykker Chrome dato, filsti og
sidetall inn i marginene.
