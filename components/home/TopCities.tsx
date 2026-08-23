import Link from "next/link";
import type { ComponentType } from "react";

const ICON_PROPS = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "#fff",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

// Monument arch — India Gate.
function ArchIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M4 21V11a8 8 0 0116 0v10" />
      <path d="M4 21h16M8 21v-6h8v6" />
    </svg>
  );
}

// Waterfront gateway arch — Gateway of India.
function GatewayIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M6 21v-8a6 6 0 1112 0v8" />
      <path d="M3 21h18M9 21v-5h6v5" />
    </svg>
  );
}

// Mosque dome + minaret.
function MosqueIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 2v2" />
      <path d="M7 12a5 5 0 0110 0v3H7z" />
      <path d="M4 21v-6a2 2 0 012-2M20 21v-6a2 2 0 00-2-2" />
      <path d="M4 21h16" />
      <path d="M9 21v-4h6v4" />
    </svg>
  );
}

// Four-minaret landmark — Charminar.
function CharminarIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M4 21V9M9 21V6M15 21V6M20 21V9" />
      <path d="M4 9l2-2 2 2M9 6l2-2 2 2M15 6l2-2 2 2M20 9l-2-2-2 2" />
      <path d="M4 21h16" />
    </svg>
  );
}

// Tree — "Garden City".
function GardenIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 21v-7" />
      <path d="M12 14a5 5 0 005-5c0-1-.4-1.8-1-2.5a4 4 0 00-4-4.5 4 4 0 00-4 4.5A5 5 0 0012 14z" />
      <path d="M9 21h6" />
    </svg>
  );
}

// Anchor — port city (Chinese fishing nets / harbour).
function AnchorIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v14" />
      <path d="M5 12H2a10 10 0 0020 0h-3" />
    </svg>
  );
}

// Palm tree + beach.
function PalmIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 21V9" />
      <path d="M12 9c0-3-2-5-5-5 0 3 2 5 5 5zM12 9c0-3 2-5 5-5 0 3-2 5-5 5zM12 10c-1-2-4-3-6-2 1 2 4 3 6 2z" />
      <path d="M4 21h16" />
    </svg>
  );
}

// Lighthouse — coastal navigation.
function LighthouseIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M10 3h4l1 4h-6z" />
      <path d="M9 7h6l2 14H7z" />
      <path d="M9 12h6M2 9l3 1M22 9l-3 1" />
    </svg>
  );
}

const TOP_CITIES: { city: string; state: string; Icon: ComponentType }[] = [
  { city: "Delhi", state: "Delhi", Icon: ArchIcon },
  { city: "Mumbai", state: "Maharashtra", Icon: GatewayIcon },
  { city: "Ahmedabad", state: "Gujarat", Icon: MosqueIcon },
  { city: "Hyderabad", state: "Telangana", Icon: CharminarIcon },
  { city: "Bengaluru", state: "Karnataka", Icon: GardenIcon },
  { city: "Kochi", state: "Kerala", Icon: AnchorIcon },
  { city: "Kozhikode", state: "Kerala", Icon: PalmIcon },
  { city: "Mangaluru", state: "Karnataka", Icon: LighthouseIcon },
];

export default function TopCities() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-20 font-inter sm:px-6" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
      <div className="text-center">
        <h2 className="text-[26px] font-extrabold tracking-tight text-[#24201A] sm:text-[30px]">
          Find Agents from Top Cities
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-[1.6] text-[#7A705E]">
          Jump straight to verified Umrah agents in India&apos;s busiest pilgrim hubs.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-4 gap-5 sm:grid-cols-4 md:grid-cols-8">
        {TOP_CITIES.map(({ city, state, Icon }) => (
          <Link
            key={city}
            href={`/?country=India&state=${encodeURIComponent(state)}&city=${encodeURIComponent(city)}#agents`}
            className="group flex flex-col items-center gap-2.5 text-center"
          >
            <div
              className="grid h-16 w-16 place-items-center rounded-full shadow-sm transition group-hover:-translate-y-0.5"
              style={{ background: "#1D6FD8" }}
            >
              <Icon />
            </div>
            <span className="text-[12.5px] font-bold text-[#24201A]">{city}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
