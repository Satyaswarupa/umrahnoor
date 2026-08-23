"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { resolveLocationQuery, searchLocations, type LocationSuggestion } from "@/lib/locations";
import { LocationError, resolveNearbyLocation } from "@/lib/geolocation";

// A search-or-near-me bar that stays on whatever package page rendered it
// (instead of routing to "/") and always pins ?service= to that package so
// the agent grid below only ever shows agents offering it.
export default function PackageSearch({ serviceSlug }: { serviceSlug: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  function scrollToAgents() {
    document.getElementById("agents")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goToLocation(state: string, city: string, coords?: { latitude: number; longitude: number }) {
    setSuggestions([]);
    const params = new URLSearchParams();
    params.set("country", "India");
    params.set("service", serviceSlug);
    if (state) params.set("state", state);
    if (city) params.set("city", city);
    if (coords) {
      params.set("lat", String(coords.latitude));
      params.set("lng", String(coords.longitude));
    }
    router.push(`${pathname}?${params.toString()}#agents`, { scroll: false });
    scrollToAgents();
  }

  function handleChangeQuery(value: string) {
    setQuery(value);
    setError(null);
    setSuggestions(value.trim() ? searchLocations(value) : []);
  }

  function handleSelectSuggestion(suggestion: LocationSuggestion) {
    setQuery(suggestion.label);
    goToLocation(suggestion.state, suggestion.city);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!query.trim()) {
      scrollToAgents();
      return;
    }
    const resolved = resolveLocationQuery(query);
    if (!resolved) {
      setError("No matching city or state found. Try another search.");
      return;
    }
    goToLocation(resolved.state, resolved.city);
  }

  async function handleNearMe() {
    setError(null);
    setLocating(true);
    try {
      const resolved = await resolveNearbyLocation();
      setQuery([resolved.city, resolved.state].filter(Boolean).join(", "));
      goToLocation(resolved.state, resolved.city, {
        latitude: resolved.latitude,
        longitude: resolved.longitude,
      });
    } catch (err) {
      setError(err instanceof LocationError ? err.message : "Could not determine your location.");
    } finally {
      setLocating(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative mt-7 max-w-[620px]">
      <div className="neu-raised flex flex-col gap-2.5 rounded-[24px] bg-white p-3 sm:flex-row sm:items-center">
        <div className="neu-pressed flex items-center gap-2.5 rounded-2xl px-4 py-3.5 sm:flex-1">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9A907C" strokeWidth={2.2} strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M16.5 16.5L21 21" />
          </svg>
          <input
            value={query}
            onChange={(e) => handleChangeQuery(e.target.value)}
            placeholder="Search city or state…"
            className="min-w-0 flex-1 border-none bg-transparent text-sm font-semibold text-[#3A342B] outline-none placeholder:text-[#9A907C]"
          />
        </div>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={handleNearMe}
            disabled={locating}
            className="neu-raised-sm flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-2xl px-[18px] py-3.5 text-[#0E5B4A] transition disabled:opacity-60 sm:flex-initial"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0E5B4A" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 3L14 21l-2.4-7.6L4 11z" />
            </svg>
            <span className="text-sm font-bold">{locating ? "Locating…" : "Near me"}</span>
          </button>
          <button
            type="submit"
            className="flex-1 rounded-2xl px-6 py-3.5 text-sm font-bold text-[#F3EFE6] shadow-sm sm:flex-initial"
            style={{ background: "#1D6FD8" }}
          >
            Search
          </button>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="neu-raised absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-2xl bg-white">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.label}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className={
                "flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[#24201A] hover:bg-[#F4F2EC]" +
                (index > 0 ? " border-t border-[#00000010]" : "")
              }
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-2 text-xs font-semibold text-[#B14A2E]">{error}</p>}
    </form>
  );
}
