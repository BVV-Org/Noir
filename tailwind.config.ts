import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

/**
 * Noir Vault design tokens.
 *
 * Colors are exposed as HSL CSS variables (see app/globals.css) so shadcn/ui
 * primitives resolve against the same source of truth. Raw brand values:
 *   Light substrate #e4e4e4 · Carbon ink #111 · Signal yellow #f9fe02
 *   Dark theme inverts substrate and ink; yellow is constant.
 *
 * The rarity scale is the platform's signature progression system
 * (Common → Rare → Epic → Legendary → Mythic) and is treated as a
 * first-class token set, not ad-hoc styling. Its colors carry tier
 * semantics only; they never appear as generic UI accents.
 *
 * Type is the structure: a condensed grotesque (Anton) deployed at
 * viewport-scale for headings, a grotesque (Archivo) for reading, and a
 * monospace (Space Mono) for the small uppercase telemetry layer.
 *
 * Corner-radius system (one rule, applied everywhere): plates and cards
 * 0.4rem (`rounded-lg`), controls near-square (`rounded-md`), tier badges
 * pill.
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem", // 20px gutters on mobile
        sm: "1.5rem",
        lg: "2rem",
        xl: "2.5rem",
      },
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        // The single pop accent — signal yellow
        yellow: {
          DEFAULT: "hsl(var(--yellow))",
          foreground: "hsl(var(--yellow-foreground))",
        },
        // The Dupe Finder's highlight (theme-aware, see globals.css)
        gold: {
          DEFAULT: "hsl(var(--gold))",
          strong: "hsl(var(--gold-strong))",
          contrast: "hsl(var(--gold-contrast))",
        },
        // Signature rarity progression
        rarity: {
          common: "hsl(var(--rarity-common))",
          rare: "hsl(var(--rarity-rare))",
          epic: "hsl(var(--rarity-epic))",
          legendary: "hsl(var(--rarity-legendary))",
          mythic: "hsl(var(--rarity-mythic))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      fontFamily: {
        // Structural display — condensed, heavy, always uppercase
        display: ["var(--font-display)", "Impact", "sans-serif"],
        // Body / UI
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        // Telemetry — uppercase mono metadata
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Telemetry / metadata
        overline: ["0.75rem", { lineHeight: "1.1", letterSpacing: "0.08em" }],
        caption: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.01em" }],
        small: ["0.875rem", { lineHeight: "1.5" }],
        // Body
        base: ["1.0625rem", { lineHeight: "1.55" }],
        lg: ["1.25rem", { lineHeight: "1.5" }],
        // Headings — leading stays tight, but never below the point where
        // Anton's tall caps collide with the line above (~0.95).
        h6: ["1rem", { lineHeight: "1.15" }],
        h5: ["1.1875rem", { lineHeight: "1.1" }],
        h4: ["1.5rem", { lineHeight: "1.1" }],
        h3: ["clamp(1.875rem, 3vw, 2.75rem)", { lineHeight: "1" }],
        h2: [
          "clamp(2.75rem, 6.5vw, 5.75rem)",
          { lineHeight: "0.98", letterSpacing: "-0.01em" },
        ],
        h1: [
          "clamp(3.5rem, 9vw, 8.5rem)",
          { lineHeight: "0.96", letterSpacing: "-0.01em" },
        ],
        // The viewport-bleeding hero scale
        display: [
          "clamp(4.25rem, 12.5vw, 13rem)",
          { lineHeight: "0.95", letterSpacing: "-0.01em" },
        ],
      },
      letterSpacing: {
        overline: "0.08em",
      },
      boxShadow: {
        // Flat system: no soft elevation. Kept minimal for overlays only.
        subtle: "0 1px 2px 0 hsl(0 0% 0% / 0.25)",
        card: "none",
        lift: "none",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out both",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 1.6s infinite",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [animate],
};

export default config;
