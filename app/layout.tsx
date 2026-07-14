import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";

/**
 * Pre-paint theme script. Reads the persisted choice (see
 * `components/providers/theme-provider.tsx`, storage key `nv-theme`) and
 * stamps `dark` on <html> before first paint, so there is no flash of the
 * wrong theme. Kept here as a plain string: a Server Component cannot import
 * non-component values from a "use client" module.
 */
const themeInitScript = `(function(){try{var t=localStorage.getItem("nv-theme");if(t!=="light")document.documentElement.classList.add("dark")}catch(e){document.documentElement.classList.add("dark")}})();`;
import { siteConfig } from "@/lib/config/site";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";
import "./globals.css";

/**
 * Root metadata. Per-route `generateMetadata` exports override the title via
 * the template and supply entity-specific descriptions, canonicals, and OG
 * images from Shopify data (TDD §11).
 *
 * `metadataBase` is what makes a route's relative `alternates.canonical`
 * resolve to an absolute URL — it is set here, once, and nowhere else.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} · ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: `${siteConfig.name} · ${siteConfig.tagline}`,
    description: siteConfig.description,
    // `images` omitted: `app/opengraph-image.tsx` supplies it, and declaring it
    // here would shadow the generated card with a hand-written URL.
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} · ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  // No `robots` here. A meta tag baked into statically prerendered HTML cannot
  // describe the environment it is served from; `app/robots.ts` gates the
  // deployment at request time instead. See lib/seo/metadata.ts.
};

export const viewport: Viewport = {
  themeColor: "#e4e4e4",
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: the pre-paint script may add `dark` to <html>
    // before React hydrates, which is the intended, persisted theme choice.
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground">
        {/* Applies the persisted theme before first paint — no theme flash. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/* Site-wide identity + the sitelinks search box target. Rendered once. */}
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />

        <a
          href="#main-content"
          className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-small font-medium text-primary-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
        >
          Skip to content
        </a>

        <Providers>
          {/*
            Footer curtain: the page content carries an opaque background and
            a higher stacking context; the footer is sticky at the viewport
            bottom behind it, so the last section scrolls away and reveals
            the footer like a lifting sheet. Pure CSS — no scroll listeners.
          */}
          <div className="flex min-h-dvh flex-col">
            <div className="relative z-10 flex flex-1 flex-col bg-background">
              <Navbar />
              <main id="main-content" className="flex-1">
                {children}
              </main>
            </div>
            <Footer className="sticky bottom-0 z-0" />
          </div>

          {/*
            Reserves the space the fixed bottom bar overlays, so the footer's
            last line is never trapped beneath it. Matches the bar's min-height
            plus the home-indicator inset.
          */}
          <div
            aria-hidden
            className="h-[calc(3.5rem+env(safe-area-inset-bottom))] lg:hidden"
          />
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}
