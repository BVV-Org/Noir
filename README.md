# Noir Vault

> **Enter The Vault. Level Up Your Scent.**

A premium, Shopify-backed fragrance discovery platform built with Next.js 15.
Discovery experience first, store second — **premium, fast, and Shopify as the
single source of truth**.

> **Repository status:** _Milestone 1 — project foundation._ This repo contains
> the production-ready scaffold: folder architecture, tooling, design tokens,
> the moved-in design-system primitives (Button, Badge, Container, Section), the
> Shopify client + data-provider abstraction (mock/live), and shared utilities.
> **No pages are built yet** — those land in the next milestones (see
> [Roadmap](#roadmap)). The app runs on the mock provider by default.

---

## Stack

| Concern     | Choice                                             |
| ----------- | -------------------------------------------------- |
| Framework   | Next.js 15 (App Router, React Server Components)   |
| Language    | TypeScript (strict)                                |
| Styling     | Tailwind CSS + design tokens as CSS variables      |
| Components  | shadcn/ui (copied-in primitives, brand-themed)     |
| Animation   | Framer Motion (`LazyMotion` + `m`)                 |
| Commerce    | Shopify Storefront API (GraphQL) — single source   |
| Icons       | lucide-react                                       |
| Tooling     | ESLint · Prettier · `tsc --noEmit`                 |
| Hosting     | Vercel                                             |

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — app runs on mock data if left blank
npm run dev                  # http://localhost:3000
```

**Scripts**

| Script                 | Purpose                              |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Start the dev server                 |
| `npm run build`        | Production build                     |
| `npm run start`        | Serve the production build           |
| `npm run lint`         | ESLint (Next core-web-vitals + TS)   |
| `npm run typecheck`    | `tsc --noEmit` (strict)              |
| `npm run format`       | Prettier write                       |
| `npm run format:check` | Prettier check                       |

## Environment variables

All configuration is environment-driven (see [`.env.example`](./.env.example)).
The key rule:

> **With `SHOPIFY_STORE_DOMAIN` + `SHOPIFY_STOREFRONT_ACCESS_TOKEN` blank, the
> app runs entirely on the mock data provider.** Going live is filling in two
> env vars — never a code change. Secrets stay server-side and are never
> shipped to the client.

## Architecture

Route groups keep URLs clean while allowing per-group layouts and auth guards.
`lib/data` is the _only_ module pages import for content — it hides whether data
is live (Shopify) or mocked, both returning **identical normalized domain
types**.

```
app/
  (marketing)/        Home, About, Contact, Journal
  (shop)/             Shop, Products, Collections, Discovery Kits
  (account)/          Account shell + Wishlist  (auth-gated; V2 seam)
  api/                revalidate · cart · newsletter
  globals.css         Tailwind + design tokens
components/
  ui/                 shadcn primitives (brand-themed)
  layout/ sections/ commerce/ product/ shop/ motion/ seo/
lib/
  data/               ← the abstraction layer: getProvider() picks shopify | mock
  shopify/            client.ts (typed Storefront fetch) · queries · mutations
                      · fragments · normalize · raw-types
  mock/data/          hand-authored fixtures (same domain types)
  animations/         durations · transitions · variants
  analytics/          typed event catalog (V2 XP-trigger seam)
  config/             site · nav · features (flags)
  utils/              cn · formatMoney · slugify · chunk
  seo/                metadata + JSON-LD helpers
  fonts.ts            Space Grotesk + Inter (next/font)
  constants.ts        cache tags · storage keys · page sizes
hooks/                use-cart · use-wishlist · use-media-query · …
types/                normalized domain types (product, collection, cart, …)
public/               favicons, OG fallback, static brand assets
```

### The data boundary (swap by env)

`lib/data` defines a single `DataProvider` contract. Two implementations satisfy
it — the live `shopify-provider` and the `mock-provider` — and both return the
same normalized domain types. **All Shopify quirks (`edges`/`node`, metafield
arrays) die in `lib/shopify/normalize.ts`; the UI never sees them.**

## Design system

Dark luxury — matte black surfaces, generous whitespace, restrained motion.
Tokens live in [`app/globals.css`](./app/globals.css) (HSL CSS variables) and are
surfaced through [`tailwind.config.ts`](./tailwind.config.ts). Always use the
semantic token, never a raw hex.

The signature system is the **rarity progression**
(Common → Rare → Epic → Legendary → Mythic), encoded as a first-class token
scale. Motion follows fixed timing tokens (hover `150ms`, transitions
`250–350ms`) and respects `prefers-reduced-motion`.

Brand colors: Background `#111111` · Foreground `#F5F5F5` · Emerald `#00C27A`
(primary) · Gold `#D4AF37` · Purple `#6A4CFF` (accent).

## Shopify data model (reference)

Content is authored in Shopify under the `nv` metafield namespace and metaobject
definitions (see the TDD §7–§8):

- **Fragrance** → Product + `nv` metafields (performance 0–100, classification,
  notes, relationships) + media.
- **Collection** → automated/smart collection (tag-driven).
- **Discovery Kit** → Product with `nv.is_kit` + `nv.kit_products`.
- **Journal article** → `nv_journal_article` metaobject.
- **Homepage composition** → ordered, toggleable `nv_homepage_section`
  metaobjects.

## Future extensibility (V2–V4)

V1 ships **seams, not features** (`technical-rules.md`). Documented extension
points, none implemented in V1:

- `(account)` route group + `lib/analytics/events.ts` typed events → V2 XP,
  achievements, leaderboards (Supabase provider added alongside `DataProvider`).
- `lib/config/features.ts` flags gate every future surface for safe rollout.
- `useWishlist` isolates storage → swap localStorage for a customer metafield.
- Stored DNA / `similar_fragrances` data → V3 recommendation engine.
- Shop reads search via the provider → swap in Algolia by changing one method.

**Data boundary rule:** Shopify stays the source of truth for commerce and
content; Supabase enters _only_ for state Shopify cannot model (XP, community,
AI history) and _only_ when those features are built. V1 requires no Supabase.

## Roadmap

1. **Initialization** — scaffold, tooling, tokens, Shopify client. ← _this repo_
2. Domain `types/` + `DataProvider` contract + mock provider & fixtures.
3. Layout shell (Navbar, Footer, MobileBottomNav, Container, Section) + motion.
4. Pages — Home → Shop → Product → Collections → Kits → Journal → About/Contact.
5. Cart (Storefront Cart API) + newsletter endpoint.
6. Live Shopify provider + normalizers + GraphQL.
7. SEO (metadata, JSON-LD, sitemap, robots), performance & a11y passes.

Targets: Lighthouse Performance / SEO / Accessibility all **≥ 95**.
