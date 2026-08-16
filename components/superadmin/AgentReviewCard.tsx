"use client";

import { useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import type { PrivateAgent } from "@/lib/types";

type Props = {
  agent: PrivateAgent;
  onApprove?: (id: string) => Promise<void> | void;
  onReject?: (id: string, reason: string) => Promise<void> | void;
  onUnlist?: (id: string) => Promise<void> | void;
};

export default function AgentReviewCard({ agent, onApprove, onReject, onUnlist }: Props) {
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  async function handleApprove() {
    if (!onApprove) return;
    setBusy(true);
    try {
      await onApprove(agent.id);
    } finally {
      setBusy(false);
    }
  }

  async function handleReject() {
    if (!onReject || !reason.trim()) return;
    setBusy(true);
    try {
      await onReject(agent.id, reason.trim());
      setRejecting(false);
      setReason("");
    } finally {
      setBusy(false);
    }
  }

  async function handleUnlist() {
    if (!onUnlist) return;
    setBusy(true);
    try {
      await onUnlist(agent.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-emerald-900/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-emerald-950">{agent.companyName}</h3>
          <p className="text-sm text-emerald-900/60">{agent.ownerName}</p>
        </div>
        <StatusBadge status={agent.verificationStatus} />
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <Info label="Email" value={agent.email} />
        <Info label="Mobile" value={agent.mobileNumber} />
        <Info label="WhatsApp" value={agent.whatsappNumber} />
        <Info label="Location" value={[agent.city, agent.state, agent.country].filter(Boolean).join(", ")} />
        <Info label="Address" value={agent.address} full />
        <Info label="GST Number" value={agent.gstNumber} />
        <Info label="Verified Certificate" value={agent.verifiedCertificate} />
        <Info
          label="Application Date"
          value={agent.createdAt ? new Date(agent.createdAt).toLocaleDateString() : "—"}
        />
      </dl>

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        {agent.gstDocument && (
          <DocLink href={agent.gstDocument.url} label="View GST Document" />
        )}
        {agent.certificateDocument && (
          <DocLink href={agent.certificateDocument.url} label="View Certificate" />
        )}
        {agent.additionalDocuments?.map((doc) => (
          <DocLink key={doc.publicId} href={doc.url} label={doc.name || "Additional Document"} />
        ))}
      </div>

      {agent.rejectionReason && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-600/20">
          Rejection reason: {agent.rejectionReason}
        </p>
      )}

      {(onApprove || onReject || onUnlist) && (
        <div className="mt-5 border-t border-emerald-900/10 pt-4">
          {rejecting ? (
            <div className="space-y-2">
              <textarea
                rows={2}
                placeholder="Enter rejection reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg border border-emerald-900/15 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReject}
                  disabled={busy || !reason.trim()}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                >
                  Confirm Reject
                </button>
                <button
                  onClick={() => setRejecting(false)}
                  disabled={busy}
                  className="rounded-lg border border-emerald-900/15 px-4 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {onApprove && (
                <button
                  onClick={handleApprove}
                  disabled={busy}
                  className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  Approve
                </button>
              )}
              {onReject && (
                <button
                  onClick={() => setRejecting(true)}
                  disabled={busy}
                  className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  Reject
                </button>
              )}
              {onUnlist && (
                <button
                  onClick={handleUnlist}
                  disabled={busy}
                  className="rounded-lg border border-emerald-900/15 px-4 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-50 disabled:opacity-50"
                >
                  Unlist Agent
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Info({ label, value, full }: { label: string; value: string; full?: boolean }) {
  if (!value) return null;
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <dt className="text-xs font-medium uppercase tracking-wide text-emerald-900/50">{label}</dt>
      <dd className="mt-0.5 text-emerald-950">{value}</dd>
    </div>
  );
}

function DocLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-lg border border-emerald-900/15 px-3 py-1.5 font-medium text-emerald-800 hover:bg-emerald-50"
    >
      {label} &rarr;
    </a>
  );
}
