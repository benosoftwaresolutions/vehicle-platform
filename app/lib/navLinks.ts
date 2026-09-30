// Single source of truth for the secondary site links. Both the footer and
// the mobile burger menu render from these lists, so adding or renaming a
// page here updates both places — they can't drift apart.

export type NavLink = { label: string; href: string }

export const PLATFORM_LINKS: NavLink[] = [
  { label: "Find a garage", href: "/garages" },
  { label: "For drivers", href: "/for-drivers" },
  { label: "For garages", href: "/for-garages" },
  { label: "Pricing", href: "/pricing" },
]

export const COMPANY_LINKS: NavLink[] = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
]
