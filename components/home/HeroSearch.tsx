"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { resolveLocationQuery, searchLocations, type LocationSuggestion } from "@/lib/locations";
import { LocationError, resolveNearbyLocation } from "@/lib/geolocation";

// The dedicated /agents search-results page was removed — the only agents
// list left is the "Agents near you" section further down this same page
// (id="agents"). A resolved search updates this same page's ?state=&city=
// query params, which that section reads to actually filter itself, then
// scrolls the visitor down to it.
function scrollToAgents() {
  document.getElementById("agents")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  function goToLocation(state: string, city: string) {
    setSuggestions([]);
    const params = new URLSearchParams();
    params.set("country", "India");
    if (state) params.set("state", state);
    if (city) params.set("city", city);
    router.push(`/?${params.toString()}#agents`, { scroll: false });
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
      goToLocation(resolved.state, resolved.city);
    } catch (err) {
      setError(err instanceof LocationError ? err.message : "Could not determine your location.");
    } finally {
      setLocating(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative mt-7 max-w-[620px]">
      <div className="neu-raised flex items-center gap-2.5 rounded-[24px] bg-[#EAE5DB] p-3">
        <div className="neu-pressed flex flex-1 items-center gap-2.5 rounded-2xl px-4 py-3.5">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9A907C" strokeWidth={2.2} strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M16.5 16.5L21 21" />
          </svg>
          <input
            value={query}
            onChange={(e) => handleChangeQuery(e.target.value)}
            placeholder="Search agent, city or area…"
            className="min-w-0 flex-1 border-none bg-transparent text-sm font-semibold text-[#3A342B] outline-none placeholder:text-[#9A907C]"
          />
        </div>
        <button
          type="button"
          onClick={handleNearMe}
          disabled={locating}
          className="neu-raised-sm flex shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl px-[18px] py-3.5 text-[#0E5B4A] transition disabled:opacity-60"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0E5B4A" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 3L14 21l-2.4-7.6L4 11z" />
          </svg>
          <span className="text-sm font-bold">{locating ? "Locating…" : "Near me"}</span>
        </button>
        <button
          type="submit"
          className="shrink-0 rounded-2xl px-6 py-3.5 text-sm font-bold text-[#F3EFE6] shadow-sm"
          style={{ background: "linear-gradient(145deg, #0E5B4A, #0A4438)" }}
        >
          Search
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="neu-raised absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-2xl bg-[#EAE5DB]">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.label}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className={
                "flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[#24201A] hover:bg-[#E4DED2]" +
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
