"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { PublicAgentSummary } from "@/lib/types";
import { resolveNearbyLocation } from "@/lib/geolocation";
import AgentCard from "@/components/AgentCard";

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
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </section>
  );
}
