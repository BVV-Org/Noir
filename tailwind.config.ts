import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

/**
 * Noir Vault design tokens — achromatic, hairline, whisper-quiet elevation.
 *
 * Colors are HSL channel variables (see app/globals.css) so shadcn/ui
 * primitives resolve against the same source of truth.
 *
 *   Paper #ffffff · Surface #fafafa · Muted #f5f5f5 · Hairline #e5e5e5
 *   Mid gray #737373 · Ink #0a0a0a · Action #171717 · Ember #e7000b
 *
 * The palette IS the system: no brand hue, no gradients, no colored shadows.
 * Emphasis comes from the dark inversion of the primary action and from type
 * weight, never from color. Ember red is reserved for destructive/error states.
 *
 * The rarity scale (Common → Mythic) keeps its tier hues because the hue is
 * data, not decoration — and it is rationed to a 6px dot inside a neutral pill.
 *
 * Radius has two jobs and only two:
 *   interactive (buttons, inputs, badges) → pill (`rounded-full`)
 *   containers (cards, panels, media)     → 24px (`rounded-xl`)
 * `rounded-md` (10px) is for surfaces nested inside a card, `rounded-sm` (6px)
 * for tiny chrome such as focus targets on text links.
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
        DEFAULT: "1.25rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: "hsl(var(--surface))",
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
        // Signature rarity progression — tier data, rendered as a dot only.
        rarity: {
          common: "hsl(var(--rarity-common))",
          rare: "hsl(var(--rarity-rare))",
          epic: "hsl(var(--rarity-epic))",
          legendary: "hsl(var(--rarity-legendary))",
          mythic: "hsl(var(--rarity-mythic))",
        },
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "18px",
        xl: "24px",
        "2xl": "24px",
        "3xl": "28px",
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        // The homepage poster headline only. Not a heading face.
        display: ["var(--font-display)", "Impact", "sans-serif"],
      },
      fontSize: {
        // 12px uppercase captions (eyebrows, table labels) — see `.overline`.
        overline: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.05em" }],
        caption: ["0.75rem", { lineHeight: "1rem" }],
        // 14px — the interface size: nav, buttons, inputs, card copy.
        small: ["0.875rem", { lineHeight: "1.25rem" }],
        // 16px — reading copy.
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        // Headings: weight 600, tracking tightens as size grows.
        h6: ["1rem", { lineHeight: "1.5rem", letterSpacing: "-0.01em" }],
        h5: ["1.125rem", { lineHeight: "1.625rem", letterSpacing: "-0.015em" }],
        h4: ["1.5rem", { lineHeight: "2rem", letterSpacing: "-0.025em" }],
        h3: ["1.875rem", { lineHeight: "2.25rem", letterSpacing: "-0.025em" }],
        h2: [
          "clamp(2rem, 1.35rem + 2vw, 3rem)",
          { lineHeight: "1.08", letterSpacing: "-0.04em" },
        ],
        h1: [
          "clamp(2.5rem, 1.5rem + 3.2vw, 4.25rem)",
          { lineHeight: "1.04", letterSpacing: "-0.05em" },
        ],
        display: [
          "clamp(3rem, 1.25rem + 5.5vw, 6rem)",
          { lineHeight: "1", letterSpacing: "-0.05em" },
        ],
      },
      letterSpacing: {
        overline: "0.05em",
      },
      maxWidth: {
        page: "1280px",
      },
      boxShadow: {
        // The card elevation: a 1px hairline ring stacked with a barely-there
        // drop. Sits WITH a border, never instead of one.
        card: "0 0 0 1px rgb(23 23 23 / 0.03), 0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        // Hover only — the product card lifting a few pixels toward the cursor.
        lift: "0 0 0 1px rgb(23 23 23 / 0.04), 0 12px 32px -12px rgb(0 0 0 / 0.14)",
        // Menus, dialogs, drawers.
        popover:
          "0 0 0 1px rgb(23 23 23 / 0.05), 0 16px 40px -12px rgb(0 0 0 / 0.18)",
        subtle: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
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
