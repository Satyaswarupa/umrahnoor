"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { COUNTRIES, INDIA_STATES, getCitiesForState } from "@/lib/locations";

type Props = {
  initialCountry?: string;
  initialState?: string;
  initialCity?: string;
  variant?: "hero" | "filter";
};

export default function LocationSearchForm({
  initialCountry = "India",
  initialState = "",
  initialCity = "",
  variant = "hero",
}: Props) {
  const router = useRouter();
  const [country, setCountry] = useState(initialCountry || "India");
  const [state, setState] = useState(initialState);
  const [city, setCity] = useState(initialCity);

  const cities = useMemo(() => getCitiesForState(state), [state]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (country) params.set("country", country);
    if (state) params.set("state", state);
    if (city) params.set("city", city);
    router.push(`/agents?${params.toString()}`);
  }

  const isHero = variant === "hero";

  return (
    <form
      onSubmit={handleSubmit}
      className={
        isHero
          ? "grid grid-cols-1 gap-3 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-emerald-900/10 sm:grid-cols-4"
          : "grid grid-cols-1 gap-3 sm:grid-cols-4"
      }
    >
      <div>
        <label className="block text-xs font-medium text-emerald-900/70">Country</label>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="mt-1 w-full rounded-lg border border-emerald-900/15 bg-white px-3 py-2 text-sm text-emerald-950 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        >
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-emerald-900/70">State</label>
        <select
          value={state}
          onChange={(e) => {
            setState(e.target.value);
            setCity("");
          }}
          className="mt-1 w-full rounded-lg border border-emerald-900/15 bg-white px-3 py-2 text-sm text-emerald-950 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        >
          <option value="">All States</option>
          {INDIA_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-emerald-900/70">City</label>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          disabled={!state}
          className="mt-1 w-full rounded-lg border border-emerald-900/15 bg-white px-3 py-2 text-sm text-emerald-950 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:bg-emerald-50/50 disabled:text-emerald-900/40"
        >
          <option value="">{state ? "All Cities" : "Select a state first"}</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-end">
        <button
          type="submit"
          className="w-full rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          Search Agents
        </button>
      </div>
    </form>
  );
}
