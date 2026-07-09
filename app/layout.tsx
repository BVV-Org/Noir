import type { Metadata, Viewport } from "next";
import { cn } from "@/lib/utils";
import { fontVariables } from "@/lib/fonts";
import { siteConfig } from "@/lib/config/site";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";
import { IS_PRODUCTION } from "@/lib/seo/metadata";
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
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    // Preview deployments must never be indexed (TDD §11).
    index: IS_PRODUCTION,
    follow: IS_PRODUCTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#111111",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // `dark` is written server-side, not applied on mount, so the palette is
    // correct in the first byte of HTML — no flash, no blocking theme script.
    <html lang="en" className={cn("dark", fontVariables)}>
      <body className="min-h-dvh bg-background text-foreground">
        {/* Site-wide identity + the sitelinks search box target. Rendered once. */}
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />

        <a
          href="#main-content"
          className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-small font-medium text-primary-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
        >
          Skip to content
        </a>

        <Providers>
          <div className="flex min-h-dvh flex-col">
            <Navbar />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
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
