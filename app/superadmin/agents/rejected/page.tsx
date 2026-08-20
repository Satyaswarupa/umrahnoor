"use client";

import { useEffect, useMemo, useState } from "react";
import AgentReviewCard from "@/components/superadmin/AgentReviewCard";
import PageHeader from "@/components/superadmin/PageHeader";
import SearchInput from "@/components/superadmin/SearchInput";
import Spinner from "@/components/Spinner";
import type { PrivateAgent } from "@/lib/types";

export default function RejectedAgentsPage() {
  const [agents, setAgents] = useState<PrivateAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/superadmin/agents?status=REJECTED");
        const data = await res.json();
        if (res.ok) setAgents(data.agents);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter((a) => (a.companyName + " " + a.ownerName).toLowerCase().includes(q));
  }, [agents, query]);

  return (
    <>
      <PageHeader
        crumb="AGENTS"
        title="Rejected Agents"
        subtitle="Applications turned down, with the reason shared with each agent"
      >
        <SearchInput value={query} onChange={setQuery} placeholder="Search agents…" />
      </PageHeader>

      <div className="mt-[22px] flex flex-col gap-[18px]">
        <div className="flex items-center gap-2.5">
          <span
            className="rounded-full px-4 py-2.5 text-[11.5px] font-extrabold tracking-[0.06em] text-[#F6E2B4]"
            style={{ background: "#CCAE2C" }}
          >
            REJECTED
          </span>
          <span className="neu-raised-sm rounded-full px-4 py-2.5 text-[11.5px] font-bold text-[#6E6455]">Newest first</span>
          <span className="ml-auto text-xs text-[#8A7F6C]">
            {shown.length} {shown.length === 1 ? "agent shown" : "agents shown"}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-[#6E6455]">
            <Spinner className="h-5 w-5" />
            <span>Loading agents...</span>
          </div>
        ) : shown.length === 0 ? (
          <div className="neu-inset rounded-3xl px-8 py-16 text-center">
            <p className="text-[15px] font-extrabold text-[#6E6455]">No rejected applications</p>
            <p className="mt-2 text-[12.5px] text-[#9A907C]">
              New applications appear here as soon as an agent submits for verification.
            </p>
          </div>
        ) : (
          shown.map((agent) => <AgentReviewCard key={agent.id} agent={agent} />)
        )}
      </div>
    </>
  );
}
