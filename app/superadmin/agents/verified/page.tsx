"use client";

import { useEffect, useState } from "react";
import AgentReviewCard from "@/components/superadmin/AgentReviewCard";
import Spinner from "@/components/Spinner";
import type { PrivateAgent } from "@/lib/types";

export default function VerifiedAgentsPage() {
  const [agents, setAgents] = useState<PrivateAgent[]>([]);
  const [loading, setLoading] = useState(true);
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

  async function handleUnlist(id: string) {
    setMessage(null);
    const res = await fetch(`/api/superadmin/agents/${id}/unlist`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setMessage({ type: "success", text: "Agent unlisted." });
      await load();
    } else {
      setMessage({ type: "error", text: data.error ?? "Failed to unlist agent" });
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-emerald-950">Verified Agents</h1>
      <p className="mt-1 text-sm text-emerald-900/70">
        These agents are verified. Unlisting hides an agent from the public site while keeping
        their verification history.
      </p>

      {message && (
        <div
          className={`mt-4 rounded-lg px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/20"
              : "bg-red-50 text-red-700 ring-1 ring-red-600/20"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mt-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-emerald-900/60">
            <Spinner className="h-5 w-5" />
            <span>Loading agents...</span>
          </div>
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
