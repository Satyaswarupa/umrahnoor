"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { PublicAgentSummary } from "@/lib/types";
import { toTelLink, toWhatsappLink } from "@/lib/contact-links";
import { getServiceLabel } from "@/lib/services";
import { resolveNearbyLocation } from "@/lib/geolocation";
import { VerifiedTick } from "@/components/VerifiedBadge";

type GridState = {
  loading: boolean;
  agents: PublicAgentSummary[];
  state: string;
  city: string;
  nearbyFallback: boolean;
  source: "search" | "near-me" | null;
};

// A single-service version of the homepage's AgentsGrid — always filters by
// the package this page is for (no "All agents" chip row), but reuses the
// same near-me / searched-location / nearby-fallback logic and card design.
export default function PackageAgentsGrid({ serviceSlug, packageLabel }: { serviceSlug: string; packageLabel: string }) {
  const searchParams = useSearchParams();
  const searchedState = searchParams.get("state") ?? "";
  const searchedCity = searchParams.get("city") ?? "";
  const searchedLat = searchParams.get("lat");
  const searchedLng = searchParams.get("lng");

  const [grid, setGrid] = useState<GridState>({
    loading: true,
    agents: [],
    state: "",
    city: "",
    nearbyFallback: false,
    source: null,
  });

  useEffect(() => {
    let cancelled = false;
    const searched = Boolean(searchedState || searchedCity);

    (async () => {
      setGrid((prev) => ({ ...prev, loading: true }));
      try {
        let resolvedState = searchedState;
        let resolvedCity = searchedCity;
        let latitude = searchedLat ? Number.parseFloat(searchedLat) : null;
        let longitude = searchedLng ? Number.parseFloat(searchedLng) : null;

        if (!searched) {
          try {
            const resolved = await resolveNearbyLocation();
            if (cancelled) return;
            resolvedState = resolved.state;
            resolvedCity = resolved.city;
            latitude = resolved.latitude;
            longitude = resolved.longitude;
          } catch {
            // Location unavailable/denied — fall through to an unfiltered,
            // service-only search instead of failing the whole grid.
          }
        }

        const params = new URLSearchParams();
        params.set("country", "India");
        params.set("service", serviceSlug);
        if (resolvedState) params.set("state", resolvedState);
        if (resolvedCity) params.set("city", resolvedCity);
        if (latitude != null && longitude != null) {
          params.set("lat", String(latitude));
          params.set("lng", String(longitude));
        }

        const res = await fetch(`/api/agents?${params.toString()}`);
        const data = await res.json();
        if (cancelled) return;

        setGrid({
          loading: false,
          agents: res.ok ? (data.agents ?? []) : [],
          state: resolvedState,
          city: resolvedCity,
          nearbyFallback: Boolean(data.nearbyFallback),
          source: searched ? "search" : resolvedState || resolvedCity ? "near-me" : null,
        });
      } catch {
        if (cancelled) return;
        setGrid({ loading: false, agents: [], state: "", city: "", nearbyFallback: false, source: null });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [serviceSlug, searchedState, searchedCity, searchedLat, searchedLng]);

  const { loading, agents, source, nearbyFallback } = grid;
  const locationLabel = [grid.city, grid.state].filter(Boolean).join(", ");
  const showingNearbyFallback = nearbyFallback && agents.length > 0;

  const title =
    agents.length === 0
      ? `No agents found${locationLabel ? ` for ${packageLabel} in ${locationLabel}` : ` for ${packageLabel} yet`}`
      : showingNearbyFallback
        ? `No ${packageLabel} agents in ${locationLabel} — nearest agents`
        : locationLabel
          ? `${packageLabel} agents in ${locationLabel}`
          : `Verified ${packageLabel} agents`;

  const subtitle =
    agents.length === 0
      ? "Try a nearby city or state, or search all of India."
      : showingNearbyFallback
        ? `No verified agents in ${locationLabel} yet — showing the ${agents.length} closest agents, nearest first.`
        : source
          ? `${agents.length} licensed operators${locationLabel ? ` in ${locationLabel}` : ""}.`
          : "Licence checked every season by our team. Contact agents directly — no forms, no middlemen.";

  return (
    <section id="agents" className="mx-auto max-w-6xl px-4 pt-20 sm:px-6" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
      <h2 className="text-[28px] font-extrabold tracking-tight text-[#24201A] sm:text-[30px]">{title}</h2>
      <p className="mt-2 text-sm text-[#7A705E]">{subtitle}</p>

      {loading ? (
        <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="neu-raised-sm h-64 animate-pulse rounded-[26px] bg-[#F4F2EC]" />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="neu-inset mt-7 rounded-[26px] px-6 py-14 text-center">
          <p className="text-sm font-semibold text-[#6E6455]">
            No verified {packageLabel} agents found{locationLabel ? ` in ${locationLabel}` : ""} yet.
          </p>
        </div>
      ) : (
        <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => {
            const gold = agent.verificationBadge === "GOLD";
            return (
              <div
                key={agent.id}
                className={
                  "relative overflow-hidden rounded-[26px] bg-white p-[22px] " +
                  (gold ? "border-2 border-[#D4A017]/70 shadow-[0_4px_20px_rgba(212,160,23,0.18)]" : "neu-raised-sm")
                }
              >
                {gold && (
                  <span
                    className="absolute right-0 top-0 rounded-bl-2xl px-3 py-1 text-[9.5px] font-extrabold tracking-[0.08em] text-white"
                    style={{ background: "#D4A017" }}
                  >
                    GOLD VERIFIED
                  </span>
                )}
                <div className="flex items-start gap-3.5">
                  <div className="neu-pressed h-[62px] w-[62px] shrink-0 rounded-[19px] p-[5px]">
                    <div className="relative h-full w-full overflow-hidden rounded-[14px] bg-[#F4F2EC]">
                      {agent.profileImage ? (
                        <Image
                          src={agent.profileImage.url}
                          alt={`${agent.companyName} — verified Umrah agent logo`}
                          fill
                          sizes="62px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-lg font-bold text-[#9A907C]">
                          {agent.companyName?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <div className="truncate text-[16px] font-extrabold tracking-tight text-[#24201A]">
                        {agent.companyName}
                      </div>
                      <VerifiedTick badge={gold ? "GOLD" : "BLUE"} />
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-[#8A7F6C]">
                      <span>
                        {[agent.city, agent.state].filter(Boolean).join(", ") || "India"}
                        {agent.experienceYears ? ` · ${agent.experienceYears} yrs experience` : ""}
                        {agent.distanceKm != null ? ` · ~${agent.distanceKm} km away` : ""}
                      </span>
                    </div>
                    {agent.businessType && (
                      <span
                        className="mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold text-[#8A6A0A]"
                        style={{ background: "rgba(212,160,23,0.12)" }}
                      >
                        {getServiceLabel(agent.businessType)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="my-4 h-px bg-gradient-to-r from-[#96897610] to-white/90" />

                <div className="flex items-center gap-2.5">
                  <div className="flex-1">
                    <div className="text-[10px] font-semibold text-[#9A907C]">Location</div>
                    <Link
                      href={`/agents/${agent.id}`}
                      className="text-[15px] font-extrabold tracking-tight text-[#24201A] hover:text-[#0E5B4A]"
                    >
                      {[agent.city, agent.state].filter(Boolean).join(", ") || "India"}
                    </Link>
                  </div>
                  <a
                    href={toTelLink(agent.mobileNumber)}
                    className="neu-raised-sm flex items-center gap-1.5 rounded-2xl px-3.5 py-2.5"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0E5B4A" strokeWidth={2} strokeLinejoin="round">
                      <path d="M6.5 3.5l3 1 1.2 3.6-2 1.6c.7 2.2 2.4 3.9 4.6 4.6l1.6-2 3.6 1.2 1 3c-.4 1.4-1.8 2.3-3.3 2C10.4 18 6 13.6 4.5 6.8c-.3-1.5.6-2.9 2-3.3z" />
                    </svg>
                    <span className="text-[13px] font-bold text-[#0E5B4A]">Call</span>
                  </a>
                  <a
                    href={toWhatsappLink(agent.whatsappNumber, agent.companyName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-2xl"
                    style={{ background: "#25D366", boxShadow: "0 4px 12px rgba(37,211,102,0.3)" }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFF">
                      <path d="M12 2.6a9.3 9.3 0 00-7.9 14.2L2.7 21.4l4.7-1.3A9.3 9.3 0 1012 2.6zm5.3 13c-.2.6-1.2 1.2-1.9 1.2-1.7 0-4.2-1.4-5.8-3.1-1.3-1.4-2.2-3.2-2.2-4.4 0-.8.5-1.6 1-1.9.3-.2.9-.2 1.1.1l1.1 1.8c.1.3.1.5-.1.8l-.5.6c-.2.2-.2.4-.1.6.5 1.1 1.6 2.2 2.7 2.7.2.1.5.1.6-.1l.6-.6c.2-.2.5-.3.8-.2l1.8 1c.3.2.3.8 0 1.5z" />
                    </svg>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
