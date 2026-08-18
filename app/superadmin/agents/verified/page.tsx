"use client";

import { useEffect, useMemo, useState } from "react";
import AgentReviewCard from "@/components/superadmin/AgentReviewCard";
import PageHeader from "@/components/superadmin/PageHeader";
import SearchInput from "@/components/superadmin/SearchInput";
import Spinner from "@/components/Spinner";
import type { PrivateAgent } from "@/lib/types";

export default function VerifiedAgentsPage() {
  const [agents, setAgents] = useState<PrivateAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/superadmin/agents?status=VERIFIED");
      const data = await res.json();
      if (res.ok) setAgents(data.agents);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleToggleListed(id: string) {
    setMessage(null);
    const res = await fetch(`/api/superadmin/agents/${id}/unlist`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setMessage({ type: "success", text: data.agent.isListed ? "Agent relisted." : "Agent unlisted." });
      await load();
    } else {
      setMessage({ type: "error", text: data.error ?? "Failed to update listing" });
    }
  }

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter((a) => (a.companyName + " " + a.ownerName).toLowerCase().includes(q));
  }, [agents, query]);

  return (
    <>
      <PageHeader
        crumb="AGENTS"
        title="Verified Agents"
        subtitle="Live on the public directory — unlist without losing verification history"
      >
        <SearchInput value={query} onChange={setQuery} placeholder="Search agents…" />
      </PageHeader>

      <div className="mt-[22px] flex flex-col gap-[18px]">
        <div className="flex items-center gap-2.5">
          <span
            className="rounded-full px-4 py-2.5 text-[11.5px] font-extrabold tracking-[0.06em] text-[#F6E2B4]"
            style={{ background: "linear-gradient(145deg, #0E5B4A, #0A4438)" }}
          >
            VERIFIED
          </span>
          <span className="neu-raised-sm rounded-full px-4 py-2.5 text-[11.5px] font-bold text-[#6E6455]">Newest first</span>
          <span className="ml-auto text-xs text-[#8A7F6C]">
            {shown.length} {shown.length === 1 ? "agent shown" : "agents shown"}
          </span>
        </div>

        {message && (
          <div
            className={
              "rounded-2xl px-5 py-3.5 text-sm font-semibold " +
              (message.type === "success" ? "bg-[#0E5B4A]/10 text-[#0A4438]" : "bg-[#C0392B]/10 text-[#A0301F]")
            }
          >
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-[#6E6455]">
            <Spinner className="h-5 w-5" />
            <span>Loading agents...</span>
          </div>
        ) : shown.length === 0 ? (
          <div className="neu-inset rounded-3xl px-8 py-16 text-center">
            <p className="text-[15px] font-extrabold text-[#6E6455]">No verified agents yet</p>
            <p className="mt-2 text-[12.5px] text-[#9A907C]">
              New applications appear here as soon as an agent submits for verification.
            </p>
          </div>
        ) : (
          shown.map((agent) => (
            <AgentReviewCard key={agent.id} agent={agent} onToggleListed={handleToggleListed} />
          ))
        )}
      </div>
    </>
  );
}
