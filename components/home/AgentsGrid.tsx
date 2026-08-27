"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { PublicAgentSummary } from "@/lib/types";
import { SERVICES } from "@/lib/services";
import { resolveNearbyLocation } from "@/lib/geolocation";
import AgentCard from "@/components/AgentCard";

// Every business type an agent can register as (superadmin and self-service
// signup both pick from this same list) — mirrored here as filter chips so
// pilgrims can filter by any of them, not just a curated subset.
const CHIPS = [
  { id: "", label: "All agents" },
  ...SERVICES.map((service) => ({ id: service.slug, label: service.label })),
];

type NearbyState = {
  loading: boolean;
  agents: PublicAgentSummary[] | null;
  state: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  // true when there was no agent in `city` itself and the list below is the
  // nearest agents elsewhere in the state, ranked by real distance.
  nearbyFallback: boolean;
  // "search" = the visitor searched a location in the hero bar (via ?state=&city=
  // on this same page); "near-me" = auto-detected on load; null = neither ran yet
  // or both came back empty, so we're showing the newest-agents fallback.
  source: "search" | "near-me" | null;
};

export default function AgentsGrid({ initialAgents }: { initialAgents: PublicAgentSummary[] }) {
  const [chip, setChip] = useState("");
  // Mirrors ?service= into `chip` without an effect (React's "adjusting
  // state during render" pattern) so the "Our Services" section's picks —
  // and its Clear Filters button — stay in sync with the chip row below.
  const [prevSearchedService, setPrevSearchedService] = useState<string | null>(null);
  const [nearby, setNearby] = useState<NearbyState>({
    loading: false,
    agents: null,
    state: "",
    city: "",
    latitude: null,
    longitude: null,
    nearbyFallback: false,
    source: null,
  });

  const searchParams = useSearchParams();
  const searchedState = searchParams.get("state") ?? "";
  const searchedCity = searchParams.get("city") ?? "";
  const searchedLat = searchParams.get("lat");
  const searchedLng = searchParams.get("lng");
  const searchedService = searchParams.get("service") ?? "";
  const searchedName = searchParams.get("q") ?? "";

  if (searchedService !== prevSearchedService) {
    setPrevSearchedService(searchedService);
    setChip(searchedService);
  }

  useEffect(() => {
    let cancelled = false;
    const searched = Boolean(searchedState || searchedCity || searchedName);
    // A name-only search (no place picked) shouldn't fall back to
    // auto-resolving the visitor's location — it should just search by name
    // across all of India, same as picking "All India" in the location bar.
    const shouldResolveNearMe = !searched;

    (async () => {
      // Only block the grid with a loading skeleton for an explicit action
      // (a search, or the header's "Near Me" button — which already carries
      // ?lat=&lng= by the time this runs). The passive auto-resolve below
      // (silent geolocation on a bare page load) keeps showing the
      // server-rendered `initialAgents` in the background instead, since it
      // can otherwise sit waiting on a location permission prompt for up to
      // 10s (see getCurrentPosition's timeout in lib/geolocation.ts) —
      // stalling content that's already on the page for that long looked
      // like the site had gotten slower, not more personalized.
      if (searched) {
        setNearby((prev) => ({ ...prev, loading: true }));
      }
      try {
        let resolvedState = searchedState;
        let resolvedCity = searchedCity;
        let latitude = searchedLat ? Number.parseFloat(searchedLat) : null;
        let longitude = searchedLng ? Number.parseFloat(searchedLng) : null;

        if (shouldResolveNearMe) {
          const resolved = await resolveNearbyLocation();
          if (cancelled) return;
          resolvedState = resolved.state;
          resolvedCity = resolved.city;
          latitude = resolved.latitude;
          longitude = resolved.longitude;
        }

        const params = new URLSearchParams();
        params.set("country", "India");
        if (resolvedState) params.set("state", resolvedState);
        if (resolvedCity) params.set("city", resolvedCity);
        if (latitude != null && longitude != null) {
          params.set("lat", String(latitude));
          params.set("lng", String(longitude));
        }
        if (searchedName) params.set("q", searchedName);

        const res = await fetch(`/api/agents?${params.toString()}`);
        const data = await res.json();
        if (cancelled) return;

        const source: NearbyState["source"] = searched ? "search" : "near-me";

        if (res.ok && data.agents?.length > 0) {
          setNearby({
            loading: false,
            agents: data.agents,
            state: resolvedState,
            city: resolvedCity,
            latitude,
            longitude,
            nearbyFallback: Boolean(data.nearbyFallback),
            source,
          });
        } else if (searched) {
          // A search that comes back empty should say so, not silently fall
          // back to an unrelated agent list — that's what "no result" looked
          // like before this fix.
          setNearby({
            loading: false,
            agents: [],
            state: resolvedState,
            city: resolvedCity,
            latitude,
            longitude,
            nearbyFallback: false,
            source,
          });
        } else {
          setNearby({
            loading: false,
            agents: null,
            state: "",
            city: "",
            latitude: null,
            longitude: null,
            nearbyFallback: false,
            source: null,
          });
        }
      } catch {
        if (cancelled) return;
        setNearby({
          loading: false,
          agents: null,
          state: "",
          city: "",
          latitude: null,
          longitude: null,
          nearbyFallback: false,
          source: null,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchedState, searchedCity, searchedLat, searchedLng, searchedName]);

  const [chipAgents, setChipAgents] = useState<PublicAgentSummary[] | null>(null);
  const [chipLoading, setChipLoading] = useState(false);

  useEffect(() => {
    // chipAgents is only read when `chip` is set (see `agents` below), so
    // there's nothing to fetch or reset when it's cleared back to "All agents".
    if (!chip) return;
    let cancelled = false;
    (async () => {
      setChipLoading(true);
      const params = new URLSearchParams();
      params.set("country", "India");
      if (nearby.state) params.set("state", nearby.state);
      if (nearby.city) params.set("city", nearby.city);
      if (nearby.latitude != null && nearby.longitude != null) {
        params.set("lat", String(nearby.latitude));
        params.set("lng", String(nearby.longitude));
      }
      if (searchedName) params.set("q", searchedName);
      params.set("service", chip);
      const res = await fetch(`/api/agents?${params.toString()}`);
      const data = await res.json();
      if (cancelled) return;
      setChipAgents(res.ok ? (data.agents ?? []) : []);
      setChipLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [chip, nearby.state, nearby.city, nearby.latitude, nearby.longitude, searchedName]);

  const loading = nearby.loading || chipLoading;
  const agents = chip ? (chipAgents ?? []) : (nearby.agents ?? initialAgents);
  const locationLabel = [nearby.city, nearby.state].filter(Boolean).join(", ");
  const noSearchResults = !chip && nearby.source === "search" && agents.length === 0;
  const showingNearbyFallback = !chip && nearby.nearbyFallback && agents.length > 0;

  // A name search takes over the heading regardless of whether a location
  // was also picked — "results for X" is the more useful framing than
  // "agents in Y" once the visitor has typed a specific agent name.
  const title = searchedName
    ? agents.length > 0
      ? `Results for "${searchedName}"`
      : `No agents named "${searchedName}"`
    : nearby.source === "search"
      ? agents.length > 0
        ? showingNearbyFallback
          ? `No agents in ${locationLabel} — nearest agents`
          : `Agents in ${locationLabel}`
        : "No agents found"
      : nearby.source === "near-me"
        ? "Agents near you"
        : "Verified Umrah agents";
  const subtitle = searchedName
    ? agents.length > 0
      ? `${agents.length} agent${agents.length === 1 ? "" : "s"} matching "${searchedName}"${locationLabel ? ` in ${locationLabel}` : ""}.`
      : `We couldn't find any verified agents named "${searchedName}"${locationLabel ? ` in ${locationLabel}` : ""}.`
    : nearby.source === "search"
      ? agents.length > 0
        ? showingNearbyFallback
          ? `No verified agents in ${locationLabel} yet — showing the ${agents.length} closest agents in ${nearby.state}, nearest first.`
          : `${agents.length} licensed operators in ${locationLabel}.`
        : `We couldn't find any verified agents in ${locationLabel} yet.`
      : nearby.source === "near-me"
        ? showingNearbyFallback
          ? `No verified agents in ${locationLabel} yet — showing the ${agents.length} closest agents nearby, nearest first.`
          : `${agents.length} licensed operators near ${locationLabel || "you"}.`
        : "Licence checked every season by our team. Contact agents directly — no forms, no middlemen.";

  return (
    <section id="agents" className="mx-auto max-w-6xl px-4 pt-20 sm:px-6" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 className="text-[28px] font-extrabold tracking-tight text-[#24201A] sm:text-[30px]">{title}</h2>
          <p className="mt-2 text-sm text-[#7A705E]">{subtitle}</p>
        </div>
        <div className="flex w-full snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:w-auto sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
          {CHIPS.map((c) => {
            const on = c.id === chip;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setChip(c.id)}
                className={
                  "shrink-0 snap-start whitespace-nowrap rounded-full px-[18px] py-2.5 text-[13px] font-bold transition " +
                  (on ? "text-[#F3EFE6] shadow-sm" : "neu-raised-sm text-[#6E6455]")
                }
                style={on ? { background: "#1D6FD8" } : undefined}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="neu-raised-sm h-64 animate-pulse rounded-[26px] bg-[#F4F2EC]" />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="neu-inset mt-7 rounded-[26px] px-6 py-14 text-center">
          <p className="text-sm font-semibold text-[#6E6455]">
            {noSearchResults
              ? `No verified agents found in ${locationLabel} yet. Try a nearby city or state.`
              : "No verified agents found for this filter yet."}
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
