export type ServiceOption = { slug: string; label: string; icon: string };

export const SERVICES: ServiceOption[] = [
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
