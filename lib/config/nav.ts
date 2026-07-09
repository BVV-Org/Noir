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
  { label: "Discovery Kits", href: "/discovery-kits" },
  { label: "Journal", href: "/journal" },
  { label: "About", href: "/about" },
];

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
