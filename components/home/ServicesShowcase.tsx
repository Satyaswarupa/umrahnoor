"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Slide = {
  slug: string;
  badge: string;
  title: string;
  subtitle: string;
  image: string;
};

const SLIDES: Slide[] = [
  {
    slug: "visa",
    badge: "Quick Process",
    title: "Visa Services",
    subtitle: "Hassle-Free Documentation • Fast Approval • Expert Help",
    image: "/services/visa.webp",
  },
  {
    slug: "full-package",
    badge: "All-Inclusive",
    title: "Full Package",
    subtitle: "Hotels • Transport • Ziyarat — bundled together",
    image: "/services/full-package.webp",
  },
  {
    slug: "air-ticket",
    badge: "Best Fares",
    title: "Air Ticket",
    subtitle: "Jeddah & Madinah Fares • Group Seats • Date Changes",
    image: "/services/air-ticket.webp",
  },
  {
    slug: "transport",
    badge: "On Time",
    title: "Transport",
    subtitle: "Airport Transfers • Intercity Travel • AC Coaches",
    image: "/services/transport.webp",
  },
  {
    slug: "group-fare-umrah",
    badge: "Group Deals",
    title: "Group Fare Umrah",
    subtitle: "Family & Group Bookings • Discounted Rates",
    image: "/services/group-fare-umrah.webp",
  },
  {
    slug: "zam-zam-water",
    badge: "Authentic",
    title: "Zam Zam Water",
    subtitle: "Sealed Cans • Home Delivery • Genuine Source",
    image: "/services/zam-zam-water.jpg",
  },
];

const QUICK_SERVICES = [
  {
    slug: "laundry",
    title: "Laundry Services",
    subtitle: "Premium Wash • Dry & Fold • Hotel Delivery",
    image: "/services/laundry.webp",
  },
  {
    slug: "umrah-guide",
    title: "Umrah Guide",
    subtitle: "Licensed Guides • Multi-language • Expert Help",
    image: "/services/umrah-guide.webp",
  },
  {
    slug: "food",
    title: "Food Services",
    subtitle: "Hygienic Meals • Veg/Non-Veg • Buffet/Box",
    image: "/services/food.webp",
  },
  {
    slug: "hotels",
    title: "Hotel Stay",
    subtitle: "3★ to 5★ Hotels • Near Haram • Best Rates",
    image: "/services/hotels.jpg",
  },
];

const TRUST_BADGES = [
  { title: "Verified Agents", subtitle: "All partners are background verified", tint: "#E4EEFB", bar: "#4C7EDB" },
  { title: "Growing Pilgrim Community", subtitle: "New Umrah journeys guided every season", tint: "#E8F3EC", bar: "#0E5B4A" },
  { title: "Affordable Pricing", subtitle: "Best market rates guaranteed", tint: "#FBF3DF", bar: "#C08A2E" },
  { title: "24/7 Support", subtitle: "WhatsApp & Call — always available", tint: "#F0EAFB", bar: "#7B5CC7" },
];

const AUTOPLAY_MS = 4000;

export default function ServicesShowcase() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, []);

  const goTo = (i: number) => setIndex(((i % SLIDES.length) + SLIDES.length) % SLIDES.length);

  return (
    <section
      className="mx-auto max-w-6xl px-4 pt-20 sm:px-6"
      style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
    >
      <h2 className="text-[28px] font-extrabold tracking-tight text-[#24201A] sm:text-[30px]">
        Everything for your trip, in one place
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-[1.6] text-[#7A705E]">
        From visa paperwork to hotel stays, verified agents on UmrahChal handle the full range of
        Umrah services.
      </p>

      <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_1fr]">
        {/* Left: auto-rotating carousel */}
        <div className="neu-raised relative h-[420px] overflow-hidden rounded-[30px] sm:h-[480px]">
          {SLIDES.map((s, i) => (
            <div
              key={s.slug}
              aria-hidden={i !== index}
              className={`absolute inset-0 flex flex-col justify-end bg-cover bg-center p-7 transition-opacity duration-700 ease-in-out sm:p-9 ${
                i === index ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              style={{
                backgroundImage: `linear-gradient(to top, rgba(10,20,16,.88), rgba(10,20,16,.15) 60%), url('${s.image}')`,
              }}
            >
              <span className="absolute right-6 top-6 rounded-full bg-white/15 px-3.5 py-1.5 text-[11px] font-bold tracking-wide text-white backdrop-blur-sm">
                {s.badge}
              </span>
              <h3 className="text-[28px] font-extrabold text-white sm:text-[32px]">{s.title}</h3>
              <p className="mt-1.5 text-sm text-white/80">{s.subtitle}</p>
            </div>
          ))}

          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous service"
            className="absolute bottom-6 right-16 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30 sm:right-20"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next service"
            className="absolute bottom-6 right-6 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          <div className="absolute bottom-7 left-7 flex gap-1.5 sm:left-9">
            {SLIDES.map((s, i) => (
              <button
                key={s.slug}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show ${s.title}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right: 2x2 quick service grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {QUICK_SERVICES.map((s) => (
            <Link
              key={s.slug}
              href="#agents"
              className="neu-raised-sm flex flex-col overflow-hidden rounded-[26px] bg-white transition hover:-translate-y-0.5"
            >
              <div
                className="h-28 w-full bg-cover bg-center"
                style={{ backgroundImage: `url('${s.image}')` }}
              />
              <div className="p-5">
                <div className="text-[16px] font-extrabold text-[#24201A]">{s.title}</div>
                <p className="mt-1 text-[12.5px] leading-[1.5] text-[#6E6455]">{s.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Trust badges */}
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST_BADGES.map((b) => (
          <div
            key={b.title}
            className="neu-raised-sm rounded-[24px] p-6 text-center"
            style={{ background: b.tint }}
          >
            <div className="text-[15px] font-extrabold text-[#24201A]">{b.title}</div>
            <p className="mt-1 text-[12.5px] leading-[1.5] text-[#6E6455]">{b.subtitle}</p>
            <div className="mx-auto mt-3 h-[3px] w-8 rounded-full" style={{ background: b.bar }} />
          </div>
        ))}
      </div>
    </section>
  );
}
