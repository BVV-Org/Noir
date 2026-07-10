# Noir Vault

> Enter The Vault. Level Up Your Scent.

A premium, Shopify-backed fragrance discovery platform. Next.js 15 (App Router),
TypeScript (strict), Tailwind, shadcn/ui primitives, Framer Motion.

**Shopify is the single source of truth.** Products, prices, collections,
inventory, media, journal articles, and the homepage's composition all originate
there. Nothing commerce-related is hardcoded.

---

## Quick start

```bash
npm install
cp .env.example .env.local     # leave the Shopify vars blank to run on mock data
npm run dev
```

Open <http://localhost:3000>.

With **no Shopify credentials**, the app runs entirely on the mock provider: 12
fragrances, 4 collections, 3 discovery kits, 4 journal articles, and a working
in-memory cart. Every page, filter, and cart mutation is exercisable. Going live
is an environment-variable change, never a code change.

### Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run type-check` | `tsc --noEmit` (alias: `typecheck`) |
| `npm run verify` | lint + type-check + build, in order |
| `npm run format` | Prettier |

---

## Architecture

The one rule that shapes everything: **pages read content only through
`getProvider()`**. They never import `lib/shopify` or a provider directly, and
they never see a Shopify shape.

```
Server Component (page)
  └─ getProvider()               lib/data/index.ts — picks by env
       ├─ shopifyProvider        live:  shopifyFetch → GraphQL → normalize()
       └─ mockProvider           mock:  in-memory fixtures
            └─ both return identical normalized domain types (types/)
```

`getProvider()` returns the live provider when `SHOPIFY_STORE_DOMAIN` **and**
`SHOPIFY_STOREFRONT_ACCESS_TOKEN` are both set, and the mock provider otherwise.
Because the *types* are the contract, swapping cannot break the UI.

```
app/
  (marketing)/     home, about, contact, journal
  (shop)/          shop, products, collections, discovery-kits
  (account)/       account (auth-gated), wishlist
  api/             cart, newsletter, contact, revalidate
  layout.tsx       fonts, providers, nav, footer, Organization + WebSite JSON-LD
  loading.tsx      root streaming fallback
  error.tsx        route error boundary
  global-error.tsx last resort: catches failures in the root layout itself
  sitemap.ts       enumerated from the provider
  robots.ts        environment-aware
  opengraph-image.tsx   social card, generated at build

components/
  ui/              shadcn primitives, themed to brand tokens
  layout/          Navbar, Footer, MobileBottomNav, Container, Section, Breadcrumbs
  sections/        modular homepage sections (data-driven)
  commerce/        ProductCard, CartDrawer, PriceTag, EmptyState…
  product/         Gallery, VariantSelector, PerformanceBar, NotesPyramid…
  shop/            FilterSidebar, SortSelect, SearchBar, QuickView…
  motion/          MotionProvider (LazyMotion), FadeIn, Reveal, Stagger
  seo/             JsonLd

lib/
  data/            provider.ts (the contract), index.ts, shopify-provider, mock-provider
  shopify/         client, queries/, mutations/, fragments/, normalize.ts, raw-types.ts
  mock/            fixtures + in-memory query engine + in-memory cart
  seo/             metadata.ts, jsonld.ts
  shop/            search-params.ts (the URL contract), facets.ts
  animations/      duration + easing tokens, variants
  config/          site, nav, metrics, features (V2 flags)
```

### Where state lives

| State | Where | Persistence |
|---|---|---|
| Cart | `useCart` → `/api/cart` | `cartId` in an **httpOnly cookie** → Shopify |
| Wishlist | `useWishlist` | `localStorage` (handles only; rehydrated live) |
| Filters / sort / search | **URL search params** | shareable, back-button-safe |
| Theme | `ThemeProvider` | dark-locked; the brand has one theme |

No global state library. Server Components + context + the URL cover it.

---

## Setup guide

### 1. Run on mock data (zero config)

`npm run dev`. That is the whole step. Use this for UI work.

### 2. Connect a Shopify store

Fill `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_ACCESS_TOKEN` in
`.env.local` and restart. Everything now reads from Shopify — **including the
cart**, which becomes a real Storefront cart with a working checkout.

Then complete the store configuration below, or pages will render empty.

---

## Shopify configuration

The live provider expects a specific store shape. `lib/shopify/metafields.ts` is
the authoritative key list; this is the operator's summary.

### Metafields — namespace `noir`, on Product

Type them in Admin so the Storefront API returns them cleanly.

| Group | Keys | Type |
|---|---|---|
| Basic | `brand`, `release_year`, `tagline` | text / integer |
| Performance | `longevity`, `projection`, `sillage`, `freshness`, `sweetness`, `versatility`, `uniqueness`, `compliment_factor` | `number_integer` (0–100) |
| Extended profile | `citrus`, `spice`, `smokiness`, `creaminess`, `green`, `aquatic`, `floral`, `woody`, `musk`, `vanilla`, `masculinity`, `femininity` | `number_integer` (stored, not surfaced in V1) |
| Classification | `fragrance_family`, `class`, `dna`, `rarity` | `single_line_text` |
| Classification (lists) | `season`, `occasion`, `mood`, `vibe` | `list.single_line_text` |
| Notes | `top_notes`, `heart_notes`, `base_notes` | `list.single_line_text` |
| Relationships | `similar_fragrances`, `related_products` | `list.product_reference` |
| Flags | `featured`, `new_arrival`, `best_seller`, `editors_pick`, `limited_drop`, `staff_favorite` | `boolean` |
| Media (optional) | `hero_video` (`file_reference` → Video), `rotation_360` | file refs |
| Kits | `is_kit` (`boolean`), `kit_products` (`list.product_reference`) | |

`noir.rarity` must be one of `Common`, `Rare`, `Epic`, `Legendary`, `Mythic`
(case-insensitive). Anything else is ignored rather than guessed at.

### Two things that are easy to get wrong

**1. Discovery kits need a tag as well as a flag.**
A kit is a Product with `noir.is_kit = true` **and** the product tag
`discovery-kit`. The flag carries the meaning; the tag makes it findable and —
critically — lets the main catalogue *exclude* it. A product with the tag but not
the flag is dropped rather than rendered as a kit.

**2. Facet values must be mirrored onto product tags.**
The Storefront `products(query:)` argument searches native fields and tags only.
**It cannot filter on metafields.** So the shop's rarity / season / mood / class /
DNA / note filters read *tags*. A fragrance must carry tags matching its `noir`
values — `Mythic`, `Winter`, `Evening`, `Oud`. A Shopify Flow rule on product
publish keeps the two in sync. `noir.*` remains the source of truth for what is
*displayed*; tags exist so Shopify's index can find things.

Full reasoning in the header of `lib/shopify/search-query.ts`.

### Metaobjects

Enable **Storefront API access** on each definition, or `metaobjects()` silently
returns nothing.

- **`nv_homepage_section`** — `title`, `subtitle`, `type` (enum: `hero`,
  `featured_collections`, `best_sellers`, `discovery_kits`, `new_arrivals`,
  `journal_preview`, `newsletter`, `cta`), `enabled` (boolean), `order` (number),
  `collection`, `products`, `cta_label`, `cta_url`, `media`.
  Toggling `enabled` or changing `order` reshapes the homepage with no deploy.
- **`nv_journal_article`** — `title`, `handle`, `hero_image`, `excerpt`,
  `author` (→ `nv_journal_author`), `reading_time`, `tags`, `body` (`rich_text`),
  `related_fragrances`, `related_articles`, `seo_title`, `seo_description`,
  `og_image`, `published_at`.
- **`nv_journal_author`** — `name`, `avatar`, `bio`, `role`.

`body` is a `rich_text` field: Shopify returns a **JSON AST, not HTML**. It is
rendered by `lib/shopify/rich-text.ts`, which escapes all text and restricts
hrefs to `http(s)` / `mailto`.

### Collections

Use **automated (smart) collections** keyed on tags. Membership is Shopify's job:
tag a product and it appears. Optional collection metafields: `noir.tagline`,
`noir.theme`.

### Webhooks → on-demand ISR

Point these at `POST https://<your-domain>/api/revalidate` and set
`SHOPIFY_REVALIDATION_SECRET` to the subscription's signing secret:

`products/create|update|delete`, `collections/create|update|delete`,
`metaobjects/create|update|delete`.

The route verifies the HMAC against the **raw** request body in constant time,
and **refuses every webhook when the secret is unset** (503). It never trusts an
unsigned request.

---

## Environment variables

Full annotated list in [`.env.example`](./.env.example).

| Variable | Required | Behaviour when absent |
|---|---|---|
| `SHOPIFY_STORE_DOMAIN` | for live | Falls back to the mock provider |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | for live | Falls back to the mock provider |
| `SHOPIFY_API_VERSION` | no | Defaults to `2025-01` |
| `SHOPIFY_REVALIDATION_SECRET` | for webhooks | `/api/revalidate` returns 503 |
| `SHOPIFY_CUSTOMER_ACCOUNT_API_URL` | no | Account shell shows "sign in" |
| `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` | no | Account shell shows "sign in" |
| `NEXT_PUBLIC_SITE_URL` | **yes in prod** | Canonicals/sitemap fall back to `noirvault.com` |
| `KLAVIYO_API_KEY` / `KLAVIYO_LIST_ID` | no | Newsletter accepts and reports `delivered: false` |
| `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_GA_ID` | no | Analytics not loaded |

Nothing fails silently: an unconfigured integration says so in the UI rather than
pretending to have worked.

---

## Deployment (Vercel)

1. Import the repository. Framework preset **Next.js**, root directory
   `noir-vault`.
2. Add the environment variables above under **Production**.
   `NEXT_PUBLIC_SITE_URL` must be your real origin — canonical URLs, the sitemap,
   and OG image URLs are all built from it.
3. Deploy. `npm run build` prerenders every product, collection, kit, and article
   via `generateStaticParams`; ISR refreshes them hourly and webhooks refresh them
   instantly.
4. Register the Shopify webhooks against the deployed `/api/revalidate`.

**Indexing is production-only.** `VERCEL_ENV` gates it: preview deployments serve
`robots.txt` with `Disallow: /` and every page with `noindex`. Vercel sets this
variable for you.

**Runtime:** `/api/revalidate` pins `runtime = "nodejs"` — it needs `node:crypto`
for HMAC verification and cannot run on the edge.

### Before going live

- [ ] Remove `images.dangerouslyAllowSVG` from `next.config.ts`. It exists only
      for the mock provider's local SVG placeholders. Live media is raster from
      the Shopify CDN, which is already allowlisted.
- [ ] Delete `public/mock/` once the live provider is the only source.
- [ ] Add a `Content-Security-Policy`. It is deliberately **not** set: a correct
      CSP here needs a per-request nonce (Next emits inline bootstrap scripts,
      and JSON-LD is inline), which means generating it in middleware. A static
      policy would either need `'unsafe-inline'` — which buys nothing — or break
      the app. Every other security header is already applied.
- [ ] Run the GraphQL layer against the real store once. See below.

---

## Known limitations

Stated plainly rather than buried.

- **The GraphQL layer has never been executed against a live store.** It
  typechecks and builds and follows the Storefront schema, but expect to shake
  out field and enum mismatches on first connection. Every runtime behaviour
  verified so far ran through the mock provider.
- **Mock carts are per-process.** They live in a module-level `Map`, survive a
  refresh (the id is in a cookie) but not a server restart, and are not shared
  across serverless instances. Real carts live in Shopify.
- **Mock checkout does not exist.** `checkoutUrl` is empty; the drawer disables
  the button and explains why rather than linking somewhere dead.
- **Reviews are a placeholder.** No provider is connected, so no rating is shown
  and no `aggregateRating` is emitted in JSON-LD. A fabricated rating is a
  structured-data violation, not a harmless stub.
- **Journal author avatars are `null` on live data.** The avatar is a file
  reference nested two levels deep, which the Storefront API will not resolve in
  one query.
- **Hero video is implemented but unexercised.** `noir.hero_video` normalizes and
  the gallery renders it; there is no mock video asset to prove it against.
- **Customer accounts are a shell.** `getCustomer()` returns `null` until the
  Customer Account API is configured — and *throws* if the env vars are set but
  the integration is unbuilt, rather than silently behaving as signed out.
- **No automated test suite.** Verification to date is `lint` + `type-check` +
  `build` plus scripted runtime checks against a running server.

---

## Extension points (V2+ — documented, not implemented)

Per `technical-rules.md`: *document extension points for future features but do
not implement them.* **None of the following exists in the codebase.**

| Future feature | The seam it plugs into |
|---|---|
| XP, achievements, leaderboards | `lib/analytics/events.ts` already names the commerce events (`add_to_cart`, `product_viewed`, `wishlist_added`) that become XP triggers. The `(account)` route group is reserved. A Supabase provider is added *alongside* `DataProvider`. |
| Quiz | `nv_quiz` / `nv_quiz_question` metaobjects are specified in the TDD but not created. Needs a `/quiz` route and one provider method. |
| AI recommendations | The full numeric DNA profile is already stored on every product (`citrus` … `femininity`) and deliberately unsurfaced. `similar_fragrances` references exist. A recommendation provider consumes them. |
| Community / profiles | The `(account)` layout and the auth boundary in `lib/auth/customer.ts` already exist. |
| Algolia search | The shop reads search through `DataProvider.searchProducts`. Swap that one implementation. |
| Wishlist sync | `useWishlist` isolates storage. Swap `localStorage` for a customer metafield; no call site changes. |
| DNA radar chart | Attaches to `components/product/performance-panel.tsx`; the data is already there. |
| Reviews | Fetch ratings in the product page's Server Component, pass to `components/product/reviews.tsx`, add `AggregateRating` to `productJsonLd`. |

Every future surface is gated by `lib/config/features.ts`, which ships with all
V2 flags **off**.

**Data boundary rule:** Shopify stays the source of truth for commerce and
content. Supabase is introduced *only* for state Shopify cannot model (XP,
achievements, leaderboards, AI history, community) — and only when those features
are built. V1 requires no Supabase.
