"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { resolveLocationQuery, searchLocations, type LocationSuggestion } from "@/lib/locations";
import { LocationError, resolveNearbyLocation } from "@/lib/geolocation";

const STORAGE_KEY = "umrahjao:location";

// The header's location control is the one place that's meant to work the
// same on every page: pick a location (or Near Me) and it's written onto the
// current page's ?state=&city=&lat=&lng= query params, which the homepage's
// AgentsGrid and the package pages' agent grids already read to filter
// themselves. It's also cached in localStorage purely so the pill shows the
// last-picked place (not "All India") when a visitor lands on a fresh page
// with no query params of its own — the query string is still what actually
// drives filtering.
export default function LocationBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storedLabel, setStoredLabel] = useState("All India");

  const urlState = searchParams.get("state");
  const urlCity = searchParams.get("city");
  const urlLabel = urlState || urlCity ? [urlCity, urlState].filter(Boolean).join(", ") || "All India" : null;
  // The URL already tells us the location whenever a page-level search ran —
  // only fall back to whatever was saved from a previous visit when it didn't.
  const label = urlLabel ?? storedLabel;

  useEffect(() => {
    if (urlLabel) return;
    // Deferred a tick so this reads as "sync with an external store", not
    // "derive state we already had" — matches the async-IIFE pattern used
    // for the near-me fetch elsewhere in this codebase (see AgentsGrid).
    (async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as { label?: string };
          if (saved.label) setStoredLabel(saved.label);
        }
      } catch {
        // localStorage unavailable — just keep the "All India" default.
      }
    })();
  }, [urlLabel]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function applyLocation(state: string, city: string, coords?: { latitude: number; longitude: number }) {
    const displayLabel = [city, state].filter(Boolean).join(", ") || "All India";
    setStoredLabel(displayLabel);
    setOpen(false);
    setQuery("");
    setSuggestions([]);
    setError(null);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, city, label: displayLabel }));
    } catch {
      // Not fatal — the pill still updates for this page view.
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("country", "India");
    if (state) params.set("state", state);
    else params.delete("state");
    if (city) params.set("city", city);
    else params.delete("city");
    if (coords) {
      params.set("lat", String(coords.latitude));
      params.set("lng", String(coords.longitude));
    } else {
      params.delete("lat");
      params.delete("lng");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handleChangeQuery(value: string) {
    setQuery(value);
    setError(null);
    setSuggestions(value.trim() ? searchLocations(value) : []);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    const resolved = resolveLocationQuery(query);
    if (!resolved) {
      setError("No matching city or state found.");
      return;
    }
    applyLocation(resolved.state, resolved.city);
  }

  async function handleNearMe() {
    setError(null);
    setLocating(true);
    try {
      const resolved = await resolveNearbyLocation();
      applyLocation(resolved.state, resolved.city, {
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
    <div className="flex min-w-0 items-center gap-2">
      <div ref={containerRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-left text-[#4A4238] transition hover:border-black/20"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9A907C" strokeWidth={2.2} className="shrink-0">
            <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21z" />
            <circle cx="12" cy="9.5" r="2.4" />
          </svg>
          <span className="max-w-[90px] truncate text-[12.5px] font-bold sm:max-w-[150px]">{label}</span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9A907C" strokeWidth={2.5} className="shrink-0">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {open && (
          <div className="neu-raised absolute left-0 top-full z-30 mt-2 w-[280px] rounded-2xl bg-white p-3 text-[#24201A]">
            <form onSubmit={handleSubmit}>
              <div className="neu-pressed flex items-center gap-2 rounded-xl px-3 py-2.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9A907C" strokeWidth={2.2} strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M16.5 16.5L21 21" />
                </svg>
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => handleChangeQuery(e.target.value)}
                  placeholder="Search city or state…"
                  className="min-w-0 flex-1 border-none bg-transparent text-[13px] font-semibold text-[#3A342B] outline-none placeholder:text-[#9A907C]"
                />
              </div>
            </form>

            {suggestions.length > 0 && (
              <div className="mt-2 max-h-52 overflow-y-auto rounded-xl border border-black/[0.06]">
                {suggestions.map((s, i) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => applyLocation(s.state, s.city)}
                    className={
                      "block w-full px-3 py-2 text-left text-[13px] font-semibold text-[#24201A] hover:bg-[#F4F2EC]" +
                      (i > 0 ? " border-t border-black/[0.05]" : "")
                    }
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => applyLocation("", "")}
              className="neu-raised-sm mt-2.5 w-full rounded-xl px-3 py-2.5 text-[12.5px] font-bold text-[#6E6455]"
            >
              All India
            </button>

            {error && <p className="mt-2 text-[11.5px] font-semibold text-[#B14A2E]">{error}</p>}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleNearMe}
        disabled={locating}
        className="flex shrink-0 items-center gap-1.5 rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-[#0E5B4A] transition hover:border-[#0E5B4A]/40 disabled:opacity-60"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0E5B4A" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21" />
        </svg>
        <span className="whitespace-nowrap text-[12.5px] font-bold">
          {locating ? "Locating…" : "Near Me"}
        </span>
      </button>

      {error && !open && <p className="hidden text-[11.5px] font-semibold text-[#B14A2E] md:block">{error}</p>}
    </div>
  );
}
