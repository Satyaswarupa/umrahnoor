"use client";

import { useEffect, useState } from "react";
import AgentReviewCard from "@/components/superadmin/AgentReviewCard";
import type { PrivateAgent } from "@/lib/types";

export default function AgentRequestsPage() {
  const [agents, setAgents] = useState<PrivateAgent[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch("/api/superadmin/agents?status=PENDING");
      const data = await res.json();
      if (res.ok) setAgents(data.agents);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleApprove(id: string) {
    const res = await fetch(`/api/superadmin/agents/${id}/approve`, { method: "POST" });
    if (res.ok) await load();
    else {
      const data = await res.json();
      alert(data.error ?? "Failed to approve agent");
    }
  }

  async function handleReject(id: string, reason: string) {
    const res = await fetch(`/api/superadmin/agents/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rejectionReason: reason }),
    });
    if (res.ok) await load();
    else {
      const data = await res.json();
      alert(data.error ?? "Failed to reject agent");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-emerald-950">Pending Agent Requests</h1>
      <p className="mt-1 text-sm text-emerald-900/70">
        Review company details and documents, then approve or reject each request.
      </p>

      <div className="mt-6 space-y-6">
        {loading ? (
          <p className="text-emerald-900/60">Loading requests...</p>
        ) : agents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-900/20 bg-white px-6 py-16 text-center">
            <p className="font-semibold text-emerald-950">No pending agent requests.</p>
          </div>
        ) : (
          agents.map((agent) => (
            <AgentReviewCard
              key={agent.id}
              agent={agent}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))
        )}
      </div>
    </div>
  );
}
