"use client";

import { useEffect, useState } from "react";
import AgentReviewCard from "@/components/superadmin/AgentReviewCard";
import type { PrivateAgent } from "@/lib/types";

export default function VerifiedAgentsPage() {
  const [agents, setAgents] = useState<PrivateAgent[]>([]);
  const [loading, setLoading] = useState(true);

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

  async function handleUnlist(id: string) {
    const res = await fetch(`/api/superadmin/agents/${id}/unlist`, { method: "POST" });
    if (res.ok) await load();
    else {
      const data = await res.json();
      alert(data.error ?? "Failed to unlist agent");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-emerald-950">Verified Agents</h1>
      <p className="mt-1 text-sm text-emerald-900/70">
        These agents are verified. Unlisting hides an agent from the public site while keeping
        their verification history.
      </p>

      <div className="mt-6 space-y-6">
        {loading ? (
          <p className="text-emerald-900/60">Loading agents...</p>
        ) : agents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-900/20 bg-white px-6 py-16 text-center">
            <p className="font-semibold text-emerald-950">No verified agents yet.</p>
          </div>
        ) : (
          agents.map((agent) => (
            <div key={agent.id}>
              <AgentReviewCard agent={agent} onUnlist={agent.isListed ? handleUnlist : undefined} />
              {!agent.isListed && (
                <p className="mt-2 text-sm font-medium text-amber-700">
                  Currently unlisted from the public site.
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
