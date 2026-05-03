// tailwind.config.mjs
// Tailwind v4 — CSS-variabler er autoriteten, dette er et minimalt bootstrap-lag

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
    "./public/**/*.html",
  ],
  darkMode: "class", // Muliggjør mørk modus hvis ønskelig senere

  theme: {
    extend: {
      // Disse er referanser til CSS-variablene i globals.css
      // Tailwind-klasser som bg-primary, text-charcoal osv. fungerer
      colors: {
        // Primærpaletten
        "dusty-olive":  "var(--color-primary)",       // #84856E
        "charcoal":     "var(--color-bg-dark)",        // #2C4251
        "dark-khaki":   "var(--color-support)",        // #262A10
        // Bakgrunner
        "bg-default":   "var(--color-bg)",             // #F5F3EF
        "bg-section":   "var(--color-bg-section)",     // #ECEAE4
        "bg-dark":      "var(--color-bg-dark)",        // #2C4251
        "bg-dark-2":    "var(--color-bg-dark-2)",      // #1E2E3A
        // Tekst
        "text-base":    "var(--color-text)",           // #2C4251
        "text-medium":  "var(--color-text-m)",         // #4A5E6A
        "text-subtle":  "var(--color-text-s)",         // #8A9EAA
        "text-inv":     "var(--color-text-inv)",       // #F5F3EF
        // Kanter
        "border-light": "var(--color-border)",         // #D8D4CC
        "border-mid":   "var(--color-border-m)",       // #C4BCAE
      },

      fontFamily: {
        display: ["Plus Jakarta Sans", "sans-serif"],
        body:    ["Plus Jakarta Sans", "sans-serif"],
      },

      fontSize: {
        // Fluid typography: clamp(min, preferert, max)
        "display-xl": ["clamp(2.5rem, 6vw, 4.5rem)",  { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2rem, 4.5vw, 3.5rem)",  { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(1.5rem, 3vw, 2.25rem)", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "body-lg":    ["1.125rem", { lineHeight: "1.7" }],
        "body-base":  ["1rem",     { lineHeight: "1.6" }],
        "body-sm":    ["0.875rem", { lineHeight: "1.6" }],
        "eyebrow":    ["0.75rem",  { lineHeight: "1", letterSpacing: "0.1em" }],
      },

      spacing: {
        // Seksjons-padding
        "section-y":    "var(--section-padding-y)",
        "section-x":    "var(--container-padding)",
      },

      maxWidth: {
        "reading": "680px",
        "container": "1280px",
      },

      borderRadius: {
        sm: "var(--r-sm)",   // 8px
        md: "var(--r-md)",   // 12px
        lg: "var(--r-lg)",   // 20px
      },

      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },

      transitionTimingFunction: {
        "ease-bre":     "var(--ease)",
        "ease-bre-out": "var(--ease-out)",
      },

      // Animasjoner tilgjengelig som Tailwind-klasser
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%":   { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "counter": {
          "from": { "counter-increment": "none" },
        },
      },
      animation: {
        "fade-up":  "fade-up 0.6s var(--ease-out) forwards",
        "fade-in":  "fade-in 0.4s var(--ease-out) forwards",
        "scale-in": "scale-in 0.5s var(--ease-out) forwards",
      },

      backgroundImage: {
        // Subtil noise-tekstur for dybde (generert via CSS)
        "noise": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
    },
  },

  plugins: [
    require("@tailwindcss/typography"),
  ],
};
