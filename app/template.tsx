import { PageTransition } from "@/components/motion/page-transition";

/**
 * Templates re-mount on every navigation (layouts do not), which is what makes
 * the route-change animation replay. Keep this file thin: anything that should
 * persist across navigations — the navbar, providers, scroll position — belongs
 * in `layout.tsx`.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
