export type NavItem = { label: string; href: string };

/** Primary navigation shared by every public page. */
export const PUBLIC_NAV: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Our team", href: "/team" },
  { label: "Events", href: "/events" },
  { label: "Gallery", href: "/gallery" },
  { label: "Visit us", href: "/#visit" },
];
