import Link from "next/link";
import { NAV_MORE_SERVICES, PACKAGES } from "@/lib/services";

// Server-rendered — the "More" dropdown opens on hover via Tailwind's
// group/group-hover, no client JS needed (mirrors the CSS-only mobile menu
// toggle already used in SiteHeader).
export default function PackagesNav({ className }: { className: string }) {
  return (
    <nav className={className}>
      {PACKAGES.map((pkg) => (
        <Link
          key={pkg.slug}
          href={`/${pkg.slug}`}
          className="whitespace-nowrap text-[15px] font-bold text-[#151A40] transition hover:text-[#1D6FD8]"
        >
          {pkg.label}s
        </Link>
      ))}

      <div className="group relative">
        <button
          type="button"
          className="flex items-center gap-1 whitespace-nowrap text-[15px] font-bold text-[#151A40] transition hover:text-[#1D6FD8]"
        >
          Customize
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        <div className="invisible absolute left-0 top-full z-30 mt-2 w-60 rounded-2xl bg-white p-2 opacity-0 shadow-[0_12px_32px_rgba(20,18,12,0.14)] transition group-hover:visible group-hover:opacity-100">
          {NAV_MORE_SERVICES.map((service) => (
            <Link
              key={service.slug}
              href={`/?service=${service.slug}#agents`}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-[#4A4238] hover:bg-[#F4F2EC]"
            >
              <span>{service.icon}</span> {service.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
