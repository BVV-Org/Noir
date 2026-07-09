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
};

export default nextConfig;
