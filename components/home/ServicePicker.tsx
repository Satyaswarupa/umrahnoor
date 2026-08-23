"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SERVICES } from "@/lib/services";

const FEATURED: { slug: string; label: string; blurb?: string }[] = [
  { slug: "visa", label: "Visa", blurb: "Quick visa processing" },
  { slug: "hotels", label: "Hotels", blurb: "5-star accommodations" },
  { slug: "transport", label: "Transport", blurb: "Comfortable travel" },
  { slug: "food", label: "Food", blurb: "Halal meals included" },
  { slug: "laundry", label: "Laundry", blurb: "Cleaning services" },
  { slug: "air-ticket", label: "Air Tickets", blurb: "Group fare discounts" },
  { slug: "umrah-guide", label: "Umrah Guide", blurb: "Expert guidance" },
  { slug: "umrah-kit", label: "Umrah Kit", blurb: "Complete essentials" },
  { slug: "zam-zam-water", label: "Zam Zam Water" },
];

function iconFor(slug: string) {
  return SERVICES.find((s) => s.slug === slug)?.icon ?? "•";
}

export default function ServicePicker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeService = searchParams.get("service") ?? "";

  function goToService(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("service", slug);
    router.push(`/?${params.toString()}#agents`, { scroll: false });
    document.getElementById("agents")?.scrollIntoView({ behavior: "smooth" });
  }

  function clearFilters() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("service");
    const query = params.toString();
    router.push(`/${query ? `?${query}` : ""}#agents`, { scroll: false });
    document.getElementById("agents")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 className="text-[28px] font-extrabold tracking-tight text-[#24201A] sm:text-[30px]">
            Our Services
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-[1.6] text-[#7A705E]">
            Pick a service to jump straight to verified agents who offer it.
          </p>
        </div>
        <button
          type="button"
          onClick={clearFilters}
          disabled={!activeService}
          className={
            "rounded-full px-[18px] py-2.5 text-[13px] font-bold transition disabled:cursor-not-allowed disabled:opacity-50 " +
            (activeService ? "text-[#F3EFE6] shadow-sm" : "neu-raised-sm text-[#6E6455]")
          }
          style={activeService ? { background: "#1D6FD8" } : undefined}
        >
          Clear Filters
        </button>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {FEATURED.map((service) => {
          const active = activeService === service.slug;
          return (
            <button
              key={service.slug}
              type="button"
              onClick={() => goToService(service.slug)}
              className={
                "rounded-[26px] bg-white p-5 text-left transition hover:-translate-y-0.5 " +
                (active ? "border-2 border-[#1D6FD8]" : "neu-raised-sm")
              }
            >
              <div
                className="grid h-[52px] w-[52px] place-items-center rounded-[17px] text-2xl"
                style={{ background: "#1D6FD8" }}
              >
                <span>{iconFor(service.slug)}</span>
              </div>
              <div className="mt-[18px] text-[17px] font-extrabold text-[#24201A]">{service.label}</div>
              {service.blurb && (
                <div className="mt-1.5 text-[13px] leading-[1.55] text-[#7A705E]">{service.blurb}</div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
