"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Mobile-only: searches agents by company name (the desktop nav's location
// bar and package pages only search by place). Always routes to the
// homepage's agent grid, which reads ?q= alongside its existing state/city
// filters — see AgentsGrid.
export default function MobileAgentSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/?q=${encodeURIComponent(trimmed)}#agents`, { scroll: false });
  }

  return (
    <form onSubmit={handleSubmit} className="pb-3 lg:hidden">
      <div className="neu-pressed flex items-center gap-2.5 rounded-xl px-3.5 py-2.5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A907C" strokeWidth={2.2} strokeLinecap="round" className="shrink-0">
          <circle cx="11" cy="11" r="7" />
          <path d="M16.5 16.5L21 21" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search agent by name…"
          className="min-w-0 flex-1 border-none bg-transparent text-sm font-semibold text-[#3A342B] outline-none placeholder:text-[#9A907C]"
        />
      </div>
    </form>
  );
}
