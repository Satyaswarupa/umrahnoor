export type ServiceOption = { slug: string; label: string; icon: string };

// The three pilgrimage package types. Shown as their own top-level nav items
// (not folded into the "More services" dropdown) and, since they live in the
// same SERVICES list below, automatically selectable wherever an agent picks
// a business type or a per-location service — no separate schema needed.
export const PACKAGES: ServiceOption[] = [
  { slug: "hajj-package", label: "Hajj Package", icon: "🕋" },
  { slug: "umrah-package", label: "Umrah Package", icon: "🕌" },
  { slug: "zyarat-package", label: "Zyarat Package", icon: "🌙" },
];

// Ancillary services shown under the nav's "More" dropdown.
export const NAV_MORE_SERVICES: ServiceOption[] = [
  { slug: "air-ticket", label: "Air Ticket", icon: "✈️" },
  { slug: "visa", label: "Visa Service", icon: "📄" },
  { slug: "hotels", label: "Hotels", icon: "🏨" },
  { slug: "transport", label: "Transport", icon: "🚌" },
  { slug: "food", label: "Food Service", icon: "🍽️" },
  { slug: "laundry", label: "Laundry", icon: "👔" },
  { slug: "umrah-guide", label: "Umrah Guide", icon: "🧭" },
  { slug: "umrah-kit", label: "Umrah Kits", icon: "🎒" },
  { slug: "zam-zam-water", label: "Zamzam Water", icon: "💧" },
];

export const SERVICES: ServiceOption[] = [
  ...PACKAGES,
  { slug: "full-package", label: "Full Package", icon: "📦" },
  { slug: "air-ticket", label: "Air Ticket", icon: "✈️" },
  { slug: "group-fare-umrah", label: "Group Fare Umrah", icon: "👥" },
  { slug: "hotels", label: "Hotels", icon: "🏨" },
  { slug: "transport", label: "Transport", icon: "🚌" },
  { slug: "food", label: "Food", icon: "🍽️" },
  { slug: "laundry", label: "Laundry", icon: "👔" },
  { slug: "umrah-guide", label: "Umrah Guide", icon: "🧭" },
  { slug: "umrah-kit", label: "Umrah Kit", icon: "🎒" },
  { slug: "zam-zam-water", label: "Zam Zam Water", icon: "💧" },
  { slug: "visa", label: "Visa", icon: "📄" },
];

export const SERVICE_SLUGS = SERVICES.map((s) => s.slug) as [string, ...string[]];

export function getServiceLabel(slug: string): string {
  return SERVICES.find((s) => s.slug === slug)?.label ?? slug;
}

export function getServiceIcon(slug: string): string {
  return SERVICES.find((s) => s.slug === slug)?.icon ?? "";
}
