"use client";

import { useState } from "react";
import Image from "next/image";
import Spinner from "@/components/Spinner";
import { getServiceLabel, SERVICES } from "@/lib/services";
import type { PrivateAgent } from "@/lib/types";

const STATUS_STYLES: Record<string, { fg: string; bg: string }> = {
  INCOMPLETE: { fg: "#5B5346", bg: "rgba(120,110,95,.18)" },
  PENDING: { fg: "#8A5A12", bg: "rgba(192,138,46,.18)" },
  VERIFIED: { fg: "#0A4438", bg: "rgba(14,91,74,.14)" },
  REJECTED: { fg: "#A0301F", bg: "rgba(192,57,43,.12)" },
};

type Props = {
  agent: PrivateAgent;
  onApprove?: (id: string) => Promise<void> | void;
  onReject?: (id: string, reason: string) => Promise<void> | void;
  onToggleListed?: (id: string) => Promise<void> | void;
};

export default function AgentReviewCard({ agent, onApprove, onReject, onToggleListed }: Props) {
  const [busyAction, setBusyAction] = useState<"approve" | "reject" | "toggle" | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const busy = busyAction !== null;

  const hasLegacyDocuments = Boolean(agent.gstDocument && agent.certificateDocument);
  const hasRequiredDocuments = Boolean(agent.govIdDocument) || hasLegacyDocuments;
  const st = STATUS_STYLES[agent.verificationStatus] ?? STATUS_STYLES.INCOMPLETE;
  const unlisted = agent.verificationStatus === "VERIFIED" && !agent.isListed;
  const typeService = agent.businessType ? SERVICES.find((s) => s.slug === agent.businessType) : undefined;

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

  async function handleToggleListed() {
    if (!onToggleListed) return;
    setBusyAction("toggle");
    try {
      await onToggleListed(agent.id);
    } finally {
      setBusyAction(null);
    }
  }

  const businessRows = [
    { k: "Business type", v: typeService ? `${typeService.icon} ${typeService.label}` : agent.businessType },
    { k: "Business email", v: agent.businessEmail },
    { k: "Business phone", v: agent.businessPhone },
    { k: "Experience", v: agent.experienceYears != null ? `${agent.experienceYears} years` : "" },
    { k: "Total bookings", v: agent.totalBookings != null ? agent.totalBookings.toLocaleString("en-IN") : "" },
    { k: "GST number", v: agent.gstNumber },
    { k: "Government ID", v: [agent.govIdType, agent.govIdNumber].filter(Boolean).join(" · ") },
    { k: "Verified certificate", v: agent.verifiedCertificate },
  ].filter((r) => r.v);

  const docs = [
    { label: "Government ID", required: true, doc: agent.govIdDocument },
    { label: "Trade License", doc: agent.tradeLicenseDocument },
    { label: "GST Certificate", doc: agent.gstCertificateDocument },
    { label: "GST Document", doc: agent.gstDocument },
    { label: "Verified Certificate", doc: agent.certificateDocument },
    ...(agent.additionalDocuments ?? []).map((d) => ({ label: d.name || "Additional Document", doc: d })),
  ];

  return (
    <div className="neu-raised rounded-3xl bg-[#EAE5DB] p-[26px]">
      <div className="flex flex-wrap items-start gap-4">
        <div className="neu-pressed relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-full">
          {agent.profileImage ? (
            <Image src={agent.profileImage.url} alt="" fill className="object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-xl font-extrabold text-[#0E5B4A]">
              {agent.companyName?.charAt(0).toUpperCase() || agent.ownerName?.charAt(0).toUpperCase() || "?"}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-lg font-extrabold tracking-tight text-[#24201A]">
            {agent.companyName || "Untitled Agency"}
          </div>
          <div className="mt-1 text-[12.5px] text-[#7A705E]">
            {agent.ownerName}
            {typeService ? ` · ${typeService.icon} ${typeService.label}` : ""}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          {unlisted && (
            <span
              className="rounded-full px-[11px] py-1.5 text-[10px] font-extrabold tracking-[0.06em]"
              style={{ color: "#8A5A12", background: "rgba(192,138,46,.18)" }}
            >
              UNLISTED
            </span>
          )}
          <span className="rounded-full px-3 py-1.5 text-[10.5px] font-extrabold tracking-[0.08em]" style={{ color: st.fg, background: st.bg }}>
            {agent.verificationStatus}
          </span>
        </div>
      </div>

      {!hasRequiredDocuments && (
        <div className="mt-4 flex items-center gap-2.5 rounded-2xl px-[15px] py-3" style={{ color: "#8A5A12", background: "rgba(192,138,46,.18)" }}>
          <span className="h-[7px] w-[7px] shrink-0 rounded-full" style={{ background: "#C08A2E" }} />
          <span className="text-xs font-bold">
            Government ID document is missing — this agent cannot be approved until it is uploaded.
          </span>
        </div>
      )}

      {unlisted && (
        <div className="mt-3.5 flex items-center gap-2.5 rounded-2xl px-[15px] py-3" style={{ color: "#8A5A12", background: "rgba(192,138,46,.18)" }}>
          <span className="h-[7px] w-[7px] shrink-0 rounded-full" style={{ background: "#C08A2E" }} />
          <span className="text-xs font-bold">Currently unlisted from the public site — verification history is kept.</span>
        </div>
      )}

      {agent.rejectionReason && (
        <div className="mt-4 rounded-2xl px-4 py-3.5" style={{ background: "rgba(192,57,43,.12)" }}>
          <div className="text-[10px] font-extrabold tracking-[0.08em] text-[#A0301F]">REJECTION REASON</div>
          <div className="mt-1.5 text-[12.5px] leading-[1.55] text-[#A0301F]">{agent.rejectionReason}</div>
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[0.9fr_1.35fr]">
        <div className="neu-pressed rounded-2xl p-[18px]">
          <div className="text-[10px] font-extrabold tracking-[0.1em] text-[#8A7F6C]">CONTACT</div>
          <div className="mt-3.5 flex flex-col gap-[11px]">
            <ContactRow label="Email" value={agent.email} />
            <ContactRow label="Mobile" value={agent.mobileNumber} />
            <ContactRow label="WhatsApp" value={agent.whatsappNumber} />
          </div>
        </div>
        <div className="neu-pressed rounded-2xl p-[18px]">
          <div className="text-[10px] font-extrabold tracking-[0.1em] text-[#8A7F6C]">BUSINESS</div>
          <div className="mt-3.5 grid grid-cols-1 gap-x-[18px] gap-y-[11px] sm:grid-cols-2">
            {businessRows.map((r) => (
              <div key={r.k}>
                <div className="text-[10.5px] text-[#9A907C]">{r.k}</div>
                <div className="mt-0.5 text-[12.5px] font-bold text-[#3A342B]">{r.v}</div>
              </div>
            ))}
          </div>
          {agent.description && (
            <div className="mt-3.5 border-t border-[#96897640] pt-3 text-xs leading-[1.6] text-[#6E6455]">
              {agent.description}
            </div>
          )}
        </div>
      </div>

      {agent.locations.length > 0 && (
        <div className="mt-5">
          <div className="text-[10px] font-extrabold tracking-[0.1em] text-[#8A7F6C]">LOCATIONS</div>
          <div className="mt-3 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {agent.locations.map((location) => (
              <div key={location.id} className="neu-raised-sm rounded-2xl p-4">
                <div className="text-[13px] font-extrabold text-[#24201A]">
                  {[location.city, location.state].filter(Boolean).join(", ") || "Untitled location"}
                </div>
                <div className="mt-1 text-[11px] leading-[1.5] text-[#8A7F6C]">
                  {[location.address, location.country, location.pincode].filter(Boolean).join(" · ")}
                </div>
                {location.services.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-[7px]">
                    {location.services.map((slug) => (
                      <span
                        key={slug}
                        className="neu-pressed inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-bold text-[#4A4238]"
                      >
                        <span className="text-[11px]">{SERVICES.find((s) => s.slug === slug)?.icon}</span>
                        {getServiceLabel(slug)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5">
        <div className="text-[10px] font-extrabold tracking-[0.1em] text-[#8A7F6C]">DOCUMENTS</div>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {docs.map((d) => {
            if (d.doc) {
              return (
                <a
                  key={d.label}
                  href={d.doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neu-raised-sm flex items-center gap-1.5 rounded-2xl px-3.5 py-2.5 text-[#0A4438]"
                >
                  <DocIcon />
                  <span className="text-[11.5px] font-bold">{d.label}</span>
                  <span className="text-[10px] font-extrabold opacity-75">OPEN</span>
                </a>
              );
            }
            const missingRequired = d.required;
            return (
              <span
                key={d.label}
                className={
                  "flex items-center gap-1.5 rounded-2xl px-3.5 py-2.5 " +
                  (missingRequired ? "border-[1.5px]" : "neu-pressed")
                }
                style={
                  missingRequired
                    ? { color: "#C0392B", borderColor: "rgba(192,57,43,.5)" }
                    : { color: "#9A907C" }
                }
              >
                <DocIcon />
                <span className="text-[11.5px] font-bold">{d.label}</span>
                <span className="text-[10px] font-extrabold opacity-75">{missingRequired ? "MISSING" : "NOT UPLOADED"}</span>
              </span>
            );
          })}
        </div>
      </div>

      <div className="my-5 h-px bg-gradient-to-r from-[#96897650] to-white/95" />

      {rejecting ? (
        <div className="neu-pressed rounded-2xl p-[18px]">
          <div className="text-xs font-extrabold text-[#A0301F]">
            Reason for rejection <span className="font-semibold text-[#9A907C]">— shared with the agent, required</span>
          </div>
          <textarea
            rows={2}
            placeholder="e.g. Government ID number does not match the uploaded document."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="neu-pressed mt-3 w-full resize-y rounded-2xl border-none bg-[#EAE5DB] px-4 py-3.5 text-[12.5px] font-semibold text-[#24201A] outline-none"
          />
          <div className="mt-3 flex gap-2.5">
            <button
              type="button"
              onClick={handleReject}
              disabled={busy || !reason.trim()}
              className="flex items-center gap-2 rounded-2xl px-5 py-3 text-[12.5px] font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-45"
              style={{ background: "#C0392B" }}
            >
              {busyAction === "reject" && <Spinner className="h-3.5 w-3.5" />}
              Confirm rejection
            </button>
            <button
              type="button"
              onClick={() => setRejecting(false)}
              disabled={busy}
              className="neu-raised-sm rounded-2xl px-5 py-3 text-[12.5px] font-bold text-[#6E6455] disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        (onApprove || onReject || onToggleListed) && (
          <div className="flex flex-wrap items-center gap-[11px]">
            {onApprove && (
              <button
                type="button"
                onClick={handleApprove}
                disabled={busy || !hasRequiredDocuments}
                title={!hasRequiredDocuments ? "Government ID document required before approval" : "Publish this agent as verified"}
                className={
                  "flex items-center gap-2 rounded-2xl px-[22px] py-[13px] text-[13px] font-extrabold transition disabled:cursor-not-allowed " +
                  (hasRequiredDocuments ? "text-[#F6E2B4]" : "neu-pressed text-[#A9A08C]")
                }
                style={
                  hasRequiredDocuments
                    ? { background: "#06042a", opacity: busyAction === "approve" ? 0.75 : 1 }
                    : undefined
                }
              >
                {busyAction === "approve" && <Spinner className="h-3.5 w-3.5" />}
                {busyAction === "approve" ? "Approving…" : "Approve"}
              </button>
            )}
            {onReject && (
              <button
                type="button"
                onClick={() => setRejecting(true)}
                disabled={busy}
                className="neu-raised-sm flex items-center gap-2 rounded-2xl border-[1.5px] px-[22px] py-[13px] text-[13px] font-extrabold text-[#C0392B] disabled:opacity-50"
                style={{ borderColor: "rgba(192,57,43,.5)" }}
              >
                Reject
              </button>
            )}
            {onToggleListed && (
              <button
                type="button"
                onClick={handleToggleListed}
                disabled={busy}
                title="Hide from the public directory, keep verification history"
                className="neu-raised-sm flex items-center gap-2 rounded-2xl border-[1.5px] px-[22px] py-[13px] text-[13px] font-extrabold text-[#4A4238] disabled:opacity-50"
                style={{ borderColor: "rgba(150,138,118,.35)" }}
              >
                {busyAction === "toggle" && <Spinner className="h-3.5 w-3.5" />}
                {busyAction === "toggle" ? "Updating…" : unlisted ? "Relist Agent" : "Unlist Agent"}
              </button>
            )}
            <span className="ml-auto text-[11px] text-[#9A907C]">
              Applied {agent.createdAt ? new Date(agent.createdAt).toLocaleDateString() : "—"} · ID {agent.id.slice(-6).toUpperCase()}
            </span>
          </div>
        )
      )}
    </div>
  );
}

function ContactRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline gap-2">
      <span className="w-[64px] shrink-0 text-[11px] text-[#9A907C]">{label}</span>
      <span className="truncate text-[12.5px] font-bold text-[#3A342B]">{value}</span>
    </div>
  );
}

function DocIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round">
      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}
