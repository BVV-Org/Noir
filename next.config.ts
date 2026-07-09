import type { NextConfig } from "next";

/**
 * Noir Vault — Next.js configuration.
 *
 * Images are served from the Shopify CDN (single source of truth), so the CDN
 * host is allowlisted here and modern formats are enabled for LCP wins.
 * Everything else stays close to Next defaults — no premature configuration.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Pin the file-tracing root to this project (a stray lockfile higher up the
  // tree would otherwise be inferred as the workspace root).
  outputFileTracingRoot: __dirname,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/**",
      },
    ],
    // The mock fixtures ship local SVG placeholders from `public/mock` (real
    // media arrives as raster from the Shopify CDN). SVG is disabled by default
    // because a hostile SVG can carry script; these are first-party build
    // artifacts, and the sandbox CSP below neutralises the class of attack
    // regardless. Remove this block once the live provider is the only source.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    // Keep large icon/animation packages tree-shaken by default.
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  /**
   * Security headers, applied to every response.
   *
   * No `Content-Security-Policy` is set here, deliberately. A correct CSP for
   * this app needs a per-request nonce (Next injects inline bootstrap scripts,
   * and the JSON-LD blocks are inline too), which means generating it in
   * middleware rather than declaring it statically. A static CSP would either
   * be broken by `'unsafe-inline'` — which buys nothing — or break the app.
   * That work is scoped in the deployment guide, not faked here.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Stop MIME sniffing turning an upload into an executable script.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Clickjacking: nothing here is meant to be framed.
          { key: "X-Frame-Options", value: "DENY" },
          // Send the origin cross-site; a full URL leaks handles and search terms.
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // No feature of this storefront needs these.
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // HSTS. Vercel terminates TLS; this tells browsers never to try http.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        // The cart is per-visitor and must never be cached by a CDN or proxy.
        source: "/api/cart",
        headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;
