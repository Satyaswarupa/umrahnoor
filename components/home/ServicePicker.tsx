import Link from "next/link";
import { SERVICES } from "@/lib/services";

const FEATURED_SLUGS = ["full-package", "visa", "air-ticket", "hotels"];

const BLURBS: Record<string, string> = {
  "full-package": "End-to-end Umrah trips — hotels, transport and ziyarat bundled together.",
  visa: "Saudi e-Visa documents, insurance and biometrics handled for you.",
  "air-ticket": "Jeddah and Madinah fares, group seats and date changes.",
  hotels: "Makkah and Madinah hotel bookings near the Haram.",
};

export default function ServicePicker() {
  const featured = FEATURED_SLUGS.map((slug) => SERVICES.find((s) => s.slug === slug)).filter(
    (s): s is (typeof SERVICES)[number] => Boolean(s),
  );

  return (
    <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
      <div className="mb-6">
        <h2 className="text-[28px] font-extrabold tracking-tight text-[#24201A] sm:text-[30px]">
          What are you looking for?
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {featured.map((service) => (
          <Link
            key={service.slug}
            href="#agents"
            className="neu-raised-sm rounded-[26px] bg-[#EAE5DB] p-5 transition hover:-translate-y-0.5"
          >
            <div
              className="grid h-[52px] w-[52px] place-items-center rounded-[17px] text-2xl"
              style={{ background: "linear-gradient(145deg, #0E5B4A, #0A4438)" }}
            >
              <span>{service.icon}</span>
            </div>
            <div className="mt-[18px] text-[17px] font-extrabold text-[#24201A]">{service.label}</div>
            <div className="mt-1.5 text-[13px] leading-[1.55] text-[#7A705E]">{BLURBS[service.slug]}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
