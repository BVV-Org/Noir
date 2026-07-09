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
  },
  experimental: {
    // Keep large icon/animation packages tree-shaken by default.
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
