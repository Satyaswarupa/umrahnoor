"use client";

import { useState } from "react";
import Image from "next/image";
import Spinner from "@/components/Spinner";
import StatusBadge from "@/components/StatusBadge";
import { getServiceLabel } from "@/lib/services";
import type { PrivateAgent } from "@/lib/types";

type Props = {
  agent: PrivateAgent;
  onApprove?: (id: string) => Promise<void> | void;
  onReject?: (id: string, reason: string) => Promise<void> | void;
  onUnlist?: (id: string) => Promise<void> | void;
};

export default function AgentReviewCard({ agent, onApprove, onReject, onUnlist }: Props) {
  const [busyAction, setBusyAction] = useState<"approve" | "reject" | "unlist" | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const busy = busyAction !== null;

  const hasLegacyDocuments = Boolean(agent.gstDocument && agent.certificateDocument);
  const hasBusinessDocuments = Boolean(agent.govIdDocument);
  const hasRequiredDocuments = hasLegacyDocuments || hasBusinessDocuments;

  async function handleApprove() {
    if (!onApprove) return;
    setBusyAction("approve");
    try {
      await onApprove(agent.id);
    } finally {
      setBusyAction(null);
    }
  }

  async function handleReject() {
    if (!onReject || !reason.trim()) return;
    setBusyAction("reject");
    try {
      await onReject(agent.id, reason.trim());
      setRejecting(false);
      setReason("");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleUnlist() {
    if (!onUnlist) return;
    setBusyAction("unlist");
    try {
      await onUnlist(agent.id);
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-emerald-900/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-emerald-50 ring-1 ring-emerald-900/10">
            {agent.profileImage ? (
              <Image src={agent.profileImage.url} alt="" fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-emerald-900/30">
                {agent.companyName?.charAt(0).toUpperCase() || agent.ownerName?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-emerald-950">{agent.companyName || "Untitled Agency"}</h3>
            <p className="text-sm text-emerald-900/60">{agent.ownerName}</p>
          </div>
        </div>
        <StatusBadge status={agent.verificationStatus} />
      </div>

      {!hasRequiredDocuments && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 ring-1 ring-amber-600/20">
          No Government ID Document uploaded yet — this agent cannot be approved until they add one.
        </p>
      )}

      <ReviewSection title="Contact">
        <Info label="Email" value={agent.email} />
        <Info label="Mobile" value={agent.mobileNumber} />
        <Info label="WhatsApp" value={agent.whatsappNumber} />
      </ReviewSection>

      <ReviewSection title="Business">
        <Info label="Business Type" value={agent.businessType} />
        <Info label="Business Email" value={agent.businessEmail} />
        <Info label="Business Phone" value={agent.businessPhone} />
        <Info label="Experience" value={agent.experienceYears != null ? `${agent.experienceYears} years` : ""} />
        <Info label="Total Bookings" value={agent.totalBookings != null ? String(agent.totalBookings) : ""} />
        <Info label="GST Number" value={agent.gstNumber} />
        <Info label="Government ID" value={[agent.govIdType, agent.govIdNumber].filter(Boolean).join(" · ")} />
        <Info label="Verified Certificate" value={agent.verifiedCertificate} />
        <Info label="Description" value={agent.description} full />
      </ReviewSection>

      {agent.locations.length > 0 && (
        <ReviewSection title={`Locations (${agent.locations.length})`}>
          <div className="sm:col-span-2 space-y-2">
            {agent.locations.map((location) => (
              <div key={location.id} className="rounded-lg bg-emerald-50/60 px-3 py-2">
                <p className="text-sm font-medium text-emerald-950">
                  {[location.city, location.state, location.country].filter(Boolean).join(", ") || "Untitled location"}
                  {location.address ? ` — ${location.address}` : ""}
                </p>
                {location.services.length > 0 && (
                  <p className="mt-1 text-xs text-emerald-800/80">
                    {location.services.map(getServiceLabel).join(", ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ReviewSection>
      )}

      {!agent.address && agent.locations.length === 0 && (
        <ReviewSection title="Location">
          <Info label="Address" value={agent.address} full />
        </ReviewSection>
      )}

      <ReviewSection title="Documents">
        <div className="sm:col-span-2 flex flex-wrap gap-2">
          <DocChip label="Government ID Document" required doc={agent.govIdDocument} />
          <DocChip label="Trade License" doc={agent.tradeLicenseDocument} />
          <DocChip label="GST Certificate" doc={agent.gstCertificateDocument} />
          <DocChip label="GST Document" doc={agent.gstDocument} />
          <DocChip label="Verified Certificate" doc={agent.certificateDocument} />
          {agent.additionalDocuments?.map((doc) => (
            <DocChip key={doc.publicId} label={doc.name || "Additional Document"} doc={doc} />
          ))}
        </div>
      </ReviewSection>

      <p className="mt-4 text-xs text-emerald-900/50">
        Applied {agent.createdAt ? new Date(agent.createdAt).toLocaleDateString() : "—"}
      </p>

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
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                >
                  {busyAction === "reject" && <Spinner className="h-4 w-4" />}
                  Confirm Reject
                </button>
                <button
                  onClick={() => setRejecting(false)}
                  disabled={busy}
                  className="rounded-lg border border-emerald-900/15 px-4 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-50 disabled:opacity-50"
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
                  disabled={busy || !hasRequiredDocuments}
                  title={!hasRequiredDocuments ? "No Government ID Document uploaded yet" : undefined}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busyAction === "approve" && <Spinner className="h-4 w-4" />}
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
                  className="inline-flex items-center gap-2 rounded-lg border border-emerald-900/15 px-4 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-50 disabled:opacity-50"
                >
                  {busyAction === "unlist" && <Spinner className="h-4 w-4" />}
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

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 border-t border-emerald-900/10 pt-4 first:mt-4 first:border-t-0 first:pt-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900/50">{title}</p>
      <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">{children}</dl>
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

function DocChip({
  label,
  required,
  doc,
}: {
  label: string;
  required?: boolean;
  doc: { url: string } | null;
}) {
  if (doc) {
    return (
      <a
        href={doc.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-900/15 px-3 py-1.5 text-sm font-medium text-emerald-800 hover:bg-emerald-50"
      >
        {label} &rarr;
      </a>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm ${
        required
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-900/10 bg-emerald-50/40 text-emerald-900/40"
      }`}
    >
      {label} — {required ? "missing" : "optional, not provided"}
    </span>
  );
}
