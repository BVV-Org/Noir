import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

/**
 * Noir Vault design tokens.
 *
 * Colors are exposed as HSL CSS variables (see app/globals.css) so shadcn/ui
 * primitives resolve against the same source of truth. Raw brand hexes:
 *   Background #111111 · Foreground #F5F5F5
 *   Emerald   #00C27A (primary) · Gold #D4AF37 · Purple #6A4CFF (accent)
 *
 * The rarity scale is the platform's signature progression system
 * (Common → Rare → Epic → Legendary → Mythic) and is treated as a
 * first-class token set, not ad-hoc styling.
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    // Consistent, generous content width — the "vault" breathes.
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem", // 20px gutters on mobile
        sm: "1.5rem",
        lg: "2rem",
        xl: "2.5rem",
      },
      screens: {
        "2xl": "1360px",
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
        // Brand signals
        gold: {
          DEFAULT: "hsl(var(--gold))",
          foreground: "hsl(var(--gold-foreground))",
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
        // Display / headings — set with restraint for the "vault" identity.
        display: [
          "var(--font-display)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        // Body / UI
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Utility / metadata
        overline: ["0.6875rem", { lineHeight: "1", letterSpacing: "0.18em" }],
        caption: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.01em" }],
        small: ["0.8125rem", { lineHeight: "1.5" }],
        // Body
        base: ["0.9375rem", { lineHeight: "1.65" }],
        lg: ["1.0625rem", { lineHeight: "1.6" }],
        // Headings — tight tracking for the display face
        h6: ["1rem", { lineHeight: "1.35", letterSpacing: "-0.01em" }],
        h5: ["1.1875rem", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        h4: ["1.4375rem", { lineHeight: "1.25", letterSpacing: "-0.015em" }],
        h3: ["1.8125rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        h2: ["2.25rem", { lineHeight: "1.12", letterSpacing: "-0.02em" }],
        h1: ["2.875rem", { lineHeight: "1.05", letterSpacing: "-0.025em" }],
        // Fluid hero display
        display: [
          "clamp(2.75rem, 6vw + 1rem, 5rem)",
          { lineHeight: "1.0", letterSpacing: "-0.03em" },
        ],
      },
      letterSpacing: {
        overline: "0.18em",
      },
      boxShadow: {
        // Soft, matte-black-appropriate elevation
        subtle: "0 1px 2px 0 hsl(0 0% 0% / 0.4)",
        card: "0 8px 30px -12px hsl(0 0% 0% / 0.6)",
        lift: "0 18px 50px -18px hsl(0 0% 0% / 0.75)",
        // Tasteful accent glows (used sparingly)
        "glow-emerald":
          "0 0 0 1px hsl(var(--primary) / 0.35), 0 8px 40px -12px hsl(var(--primary) / 0.35)",
        "glow-gold":
          "0 0 0 1px hsl(var(--gold) / 0.35), 0 8px 40px -12px hsl(var(--gold) / 0.35)",
      },
      backgroundImage: {
        "vault-radial":
          "radial-gradient(120% 120% at 50% 0%, hsl(0 0% 12%) 0%, hsl(var(--background)) 55%)",
        hairline:
          "linear-gradient(90deg, transparent, hsl(var(--border)) 20%, hsl(var(--border)) 80%, transparent)",
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
        // Premium ease-out (feels expensive without being slow)
        premium: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [animate],
};

export default config;
