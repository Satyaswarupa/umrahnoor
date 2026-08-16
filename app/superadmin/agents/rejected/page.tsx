"use client";

import { useEffect, useState } from "react";
import AgentReviewCard from "@/components/superadmin/AgentReviewCard";
import type { PrivateAgent } from "@/lib/types";

export default function RejectedAgentsPage() {
  const [agents, setAgents] = useState<PrivateAgent[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-emerald-950">Rejected Agents</h1>
      <p className="mt-1 text-sm text-emerald-900/70">
        These agents were rejected. They can update their information and resubmit for review.
      </p>

      <div className="mt-6 space-y-6">
        {loading ? (
          <p className="text-emerald-900/60">Loading agents...</p>
        ) : agents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-900/20 bg-white px-6 py-16 text-center">
            <p className="font-semibold text-emerald-950">No rejected agents.</p>
          </div>
        ) : (
          agents.map((agent) => <AgentReviewCard key={agent.id} agent={agent} />)
        )}
      </div>
    </div>
  );
}
