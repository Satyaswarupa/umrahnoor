"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { PublicAgentSummary } from "@/lib/types";
import { toTelLink, toWhatsappLink } from "@/lib/contact-links";
import { SERVICES, getServiceIcon, getServiceLabel } from "@/lib/services";
import { resolveNearbyLocation } from "@/lib/geolocation";
import { VerifiedTick } from "@/components/VerifiedBadge";

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
    loading: true,
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

  if (searchedService !== prevSearchedService) {
    setPrevSearchedService(searchedService);
    setChip(searchedService);
  }

  useEffect(() => {
    let cancelled = false;
    const searched = Boolean(searchedState || searchedCity);

    (async () => {
      setNearby((prev) => ({ ...prev, loading: true }));
      try {
        let resolvedState = searchedState;
        let resolvedCity = searchedCity;
        let latitude = searchedLat ? Number.parseFloat(searchedLat) : null;
        let longitude = searchedLng ? Number.parseFloat(searchedLng) : null;

        if (!searched) {
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
  }, [searchedState, searchedCity, searchedLat, searchedLng]);

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
  }, [chip, nearby.state, nearby.city, nearby.latitude, nearby.longitude]);

  const loading = nearby.loading || chipLoading;
  const agents = chip ? (chipAgents ?? []) : (nearby.agents ?? initialAgents);
  const locationLabel = [nearby.city, nearby.state].filter(Boolean).join(", ");
  const noSearchResults = !chip && nearby.source === "search" && agents.length === 0;
  const showingNearbyFallback = !chip && nearby.nearbyFallback && agents.length > 0;

  const title =
    nearby.source === "search"
      ? agents.length > 0
        ? showingNearbyFallback
          ? `No agents in ${locationLabel} — nearest agents`
          : `Agents in ${locationLabel}`
        : "No agents found"
      : nearby.source === "near-me"
        ? "Agents near you"
        : "Verified Umrah agents";
  const subtitle =
    nearby.source === "search"
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
        <div className="flex flex-wrap gap-2">
          {CHIPS.map((c) => {
            const on = c.id === chip;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setChip(c.id)}
                className={
                  "rounded-full px-[18px] py-2.5 text-[13px] font-bold transition " +
                  (on ? "text-[#F3EFE6] shadow-sm" : "neu-raised-sm text-[#6E6455]")
                }
                style={on ? { background: "#CCAE2C" } : undefined}
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
                      {getServiceIcon(agent.businessType)} {getServiceLabel(agent.businessType)}
                    </span>
                  )}
                </div>
              </div>

              {agent.services && agent.services.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {agent.services.slice(0, 3).map((slug) => (
                    <span
                      key={slug}
                      className="neu-pressed rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide text-[#6E6455]"
                    >
                      {getServiceLabel(slug)}
                    </span>
                  ))}
                </div>
              )}

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
