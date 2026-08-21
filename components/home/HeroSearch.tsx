"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { PublicAgentSummary } from "@/lib/types";

// The dedicated /agents search-results page was removed — the only agents
// list left is the "Agents near you" section further down this same page
// (id="agents"). A resolved search updates this same page's ?q= query
// param, which that section reads to actually filter itself, then scrolls
// the visitor down to it.
function scrollToAgents() {
  document.getElementById("agents")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const MIN_QUERY_LENGTH = 2;
const SUGGESTION_LIMIT = 5;

export default function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PublicAgentSummary[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounced as-you-type name lookup against the same /api/agents?q= the
  // full grid below uses — reuses its companyName regex match instead of
  // introducing a second search codepath.
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        params.set("country", "India");
        params.set("q", trimmed);
        const res = await fetch(`/api/agents?${params.toString()}`);
        const data = await res.json();
        if (cancelled) return;
        setSuggestions((data.agents ?? []).slice(0, SUGGESTION_LIMIT));
      } catch {
        if (!cancelled) setSuggestions([]);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  function goSearch(name: string) {
    setShowSuggestions(false);
    const params = new URLSearchParams();
    params.set("q", name);
    router.push(`/?${params.toString()}#agents`, { scroll: false });
    scrollToAgents();
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setShowSuggestions(false);
      scrollToAgents();
      return;
    }
    goSearch(trimmed);
  }

  function handleSelectSuggestion(agent: PublicAgentSummary) {
    setQuery(agent.companyName);
    setShowSuggestions(false);
    router.push(`/agents/${agent.id}`);
  }

  const visibleSuggestions = showSuggestions ? suggestions : [];

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
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Search agent name…"
            className="min-w-0 flex-1 border-none bg-transparent text-sm font-semibold text-[#3A342B] outline-none placeholder:text-[#9A907C]"
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          className="rounded-2xl px-6 py-3.5 text-sm font-bold text-[#F3EFE6] shadow-sm"
          style={{ background: "#CCAE2C" }}
        >
          Search
        </button>
      </div>

      {visibleSuggestions.length > 0 && (
        <div className="neu-raised absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-2xl bg-white">
          {visibleSuggestions.map((agent, index) => (
            <button
              key={agent.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelectSuggestion(agent)}
              className={
                "flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left hover:bg-[#F4F2EC]" +
                (index > 0 ? " border-t border-[#00000010]" : "")
              }
            >
              <span className="text-sm font-semibold text-[#24201A]">{agent.companyName}</span>
              <span className="text-xs text-[#9A907C]">
                {[agent.city, agent.state].filter(Boolean).join(", ")}
              </span>
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
