/**
 * Navigation config — the structural nav lives in code (routes are fixed);
 * the *content* those routes render always comes from Shopify.
 */
export interface NavItem {
  label: string;
  href: string;
}

export const mainNav: NavItem[] = [
  { label: "Shop", href: "/shop" },
  { label: "Collections", href: "/collections" },
  { label: "Dupe Finder", href: "/dupe-finder" },
  { label: "Discovery Kits", href: "/discovery-kits" },
  { label: "Journal", href: "/journal" },
  { label: "About", href: "/about" },
];

/**
 * Icon identifiers for the mobile bottom bar. Names, not components: this
 * module is plain data, and the mapping to `lucide-react` lives in the
 * component that renders it (coding-standards.md — UI separate from config).
 */
export type NavIcon = "home" | "shop" | "collections" | "kits" | "wishlist";

export interface BottomNavItem extends NavItem {
  icon: NavIcon;
}

/**
 * The mobile bottom bar — five destinations, the practical ceiling for ≥44px
 * touch targets at a 360px viewport (TDD §14). Everything else in `mainNav`
 * stays one tap away behind the navbar's menu.
 */
export const bottomNav: BottomNavItem[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Shop", href: "/shop", icon: "shop" },
  { label: "Collections", href: "/collections", icon: "collections" },
  { label: "Kits", href: "/discovery-kits", icon: "kits" },
  { label: "Wishlist", href: "/wishlist", icon: "wishlist" },
];

/**
 * Whether `href` is the section the visitor is currently in.
 *
 * Nested routes light up their parent (`/products/aventus` marks `/shop`'s
 * sibling links inactive but `/journal/some-post` marks `/journal` active), so
 * the check is prefix-based on a path boundary — `/shop` must not match
 * `/shopping`. Home is exact-match only, or it would always be active.
 */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Explore",
    items: [
      { label: "Shop", href: "/shop" },
      { label: "Collections", href: "/collections" },
      { label: "Discovery Kits", href: "/discovery-kits" },
    ],
  },
  {
    title: "Discover",
    items: [
      { label: "Journal", href: "/journal" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "My Account", href: "/account" },
      { label: "Orders", href: "/account/orders" },
      { label: "Wishlist", href: "/wishlist" },
    ],
  },
];
