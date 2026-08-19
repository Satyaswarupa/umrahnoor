"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Field, inputClass, selectClass } from "@/components/form";
import Spinner from "@/components/Spinner";
import LogoutButton from "@/components/LogoutButton";
import { COUNTRIES, INDIA_STATES, getCitiesForState } from "@/lib/locations";
import { GOVERNMENT_ID_TYPES } from "@/lib/agent-options";
import { SERVICES, getServiceLabel } from "@/lib/services";
import type { AgentDoc, AgentLocation, PrivateAgent } from "@/lib/types";

const jakarta = { fontFamily: "var(--font-jakarta), sans-serif" };
const amiri = { fontFamily: "var(--font-amiri), serif" };

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: "◈" },
  { key: "info", label: "All Info", icon: "☰" },
  { key: "subscription", label: "Subscription", icon: "◇" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const STATUS_STYLES: Record<string, { fg: string; bg: string; dot: string }> = {
  INCOMPLETE: { fg: "#5B5346", bg: "rgba(120,110,95,.18)", dot: "#8A7F6C" },
  PENDING: { fg: "#8A5A12", bg: "rgba(192,138,46,.18)", dot: "#C08A2E" },
  VERIFIED: { fg: "#0A4438", bg: "rgba(14,91,74,.14)", dot: "#0E5B4A" },
  REJECTED: { fg: "#A0301F", bg: "rgba(192,57,43,.12)", dot: "#C0392B" },
};
const STATUS_LABELS: Record<string, string> = {
  INCOMPLETE: "Incomplete",
  PENDING: "Pending Review",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
};

type DocKey = "govId" | "tradeLicense" | "gstCertificate" | "gst" | "certificate";
const DOC_FIELDS: { key: DocKey; label: string; required?: boolean; note: string }[] = [
  { key: "govId", label: "Government ID", required: true, note: "Aadhaar, Passport or Voter ID of the owner." },
  { key: "tradeLicense", label: "Trade License", note: "Municipal / shop establishment licence." },
  { key: "gstCertificate", label: "GST Certificate", note: "Registration certificate in the business name." },
  { key: "gst", label: "GST Document", note: "Latest filed return or GST letter." },
  { key: "certificate", label: "Verified Certificate", note: "Hajj committee / IATA / tourism board proof." },
];

const emptyProfile = {
  companyName: "",
  ownerName: "",
  mobileNumber: "",
  whatsappNumber: "",
  gstNumber: "",
  verifiedCertificate: "",
  description: "",
  businessType: "",
  businessEmail: "",
  businessPhone: "",
  experienceYears: "",
  totalBookings: "",
  startingPrice: "",
  govIdType: "",
  govIdNumber: "",
};

function profileFromAgent(agent: PrivateAgent) {
  return {
    companyName: agent.companyName ?? "",
    ownerName: agent.ownerName ?? "",
    mobileNumber: agent.mobileNumber ?? "",
    whatsappNumber: agent.whatsappNumber ?? "",
    gstNumber: agent.gstNumber ?? "",
    verifiedCertificate: agent.verifiedCertificate ?? "",
    description: agent.description ?? "",
    businessType: agent.businessType ?? "",
    businessEmail: agent.businessEmail ?? "",
    businessPhone: agent.businessPhone ?? "",
    experienceYears: agent.experienceYears != null ? String(agent.experienceYears) : "",
    totalBookings: agent.totalBookings != null ? String(agent.totalBookings) : "",
    startingPrice: agent.startingPrice != null ? String(agent.startingPrice) : "",
    govIdType: agent.govIdType ?? "",
    govIdNumber: agent.govIdNumber ?? "",
  };
}

const emptyLocationDraft = {
  country: "India",
  state: "",
  city: "",
  pincode: "",
  address: "",
  services: [] as string[],
};

export default function AgentDashboardPage() {
  const [agent, setAgent] = useState<PrivateAgent | null>(null);
  const [profile, setProfile] = useState(emptyProfile);
  const [tab, setTab] = useState<TabKey>("dashboard");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [uploading, setUploading] = useState<string | null>(null);
  const [addDocLabel, setAddDocLabel] = useState("");

  const [editingBusinessInfo, setEditingBusinessInfo] = useState(false);

  const [locationDraft, setLocationDraft] = useState<(typeof emptyLocationDraft & { id: string | null }) | null>(
    null
  );
  const [savingLocation, setSavingLocation] = useState(false);

  const cities = useMemo(() => getCitiesForState(locationDraft?.state ?? ""), [locationDraft?.state]);

  async function loadAgent() {
    try {
      const res = await fetch("/api/agent/profile");
      const data = await res.json();
      if (res.ok) {
        setAgent(data.agent);
        setProfile(profileFromAgent(data.agent));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAgent();
  }, []);

  async function saveProfileFields() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/agent/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          experienceYears: profile.experienceYears ? Number(profile.experienceYears) : null,
          totalBookings: profile.totalBookings ? Number(profile.totalBookings) : null,
          startingPrice: profile.startingPrice ? Number(profile.startingPrice) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to save profile" });
        return false;
      }
      setAgent(data.agent);
      setProfile(profileFromAgent(data.agent));
      setMessage({ type: "success", text: "Saved." });
      return true;
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveBusinessInfoSection() {
    const ok = await saveProfileFields();
    if (ok) setEditingBusinessInfo(false);
  }

  function handleCancelBusinessInfoSection() {
    if (agent) setProfile(profileFromAgent(agent));
    setEditingBusinessInfo(false);
    setMessage(null);
  }

  async function handleUpload(
    type: "gst" | "certificate" | "additional" | "govId" | "tradeLicense" | "gstCertificate" | "profile",
    file: File,
    name?: string
  ) {
    setUploading(type);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.set("type", type);
      formData.set("file", file);
      if (name) formData.set("name", name);
      const res = await fetch("/api/agent/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Upload failed" });
        return;
      }
      await loadAgent();
      if (type === "additional") setAddDocLabel("");
      setMessage({ type: "success", text: "Uploaded successfully." });
    } catch {
      setMessage({ type: "error", text: "Network error during upload." });
    } finally {
      setUploading(null);
    }
  }

  async function handleRemoveAdditionalDocument(publicId: string) {
    setMessage(null);
    try {
      const res = await fetch(`/api/agent/upload?publicId=${encodeURIComponent(publicId)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to remove document" });
        return;
      }
      setAgent(data.agent);
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    }
  }

  async function handleSubmitVerification() {
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/agent/submit", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to submit for verification" });
        return;
      }
      setAgent(data.agent);
      setSubmitSuccess(true);
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  function handleRegisterClick() {
    setMessage(null);
    setEditingBusinessInfo(true);
    setTab("info");
  }

  function startAddLocation() {
    setMessage(null);
    setLocationDraft({ ...emptyLocationDraft, id: null });
  }

  function startEditLocation(location: AgentLocation) {
    setMessage(null);
    setLocationDraft({
      id: location.id,
      country: location.country || "India",
      state: location.state,
      city: location.city,
      pincode: location.pincode,
      address: location.address,
      services: location.services,
    });
  }

  function toggleDraftService(slug: string) {
    setLocationDraft((prev) =>
      prev
        ? {
            ...prev,
            services: prev.services.includes(slug)
              ? prev.services.filter((s) => s !== slug)
              : [...prev.services, slug],
          }
        : prev
    );
  }

  async function handleSaveLocation() {
    if (!locationDraft) return;
    setSavingLocation(true);
    setMessage(null);
    try {
      const url = locationDraft.id ? `/api/agent/locations/${locationDraft.id}` : "/api/agent/locations";
      const res = await fetch(url, {
        method: locationDraft.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: locationDraft.country,
          state: locationDraft.state,
          city: locationDraft.city,
          pincode: locationDraft.pincode,
          address: locationDraft.address,
          services: locationDraft.services,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to save location" });
        return;
      }
      setAgent(data.agent);
      setLocationDraft(null);
      setMessage({ type: "success", text: "Location saved." });
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSavingLocation(false);
    }
  }

  async function handleDeleteLocation(locationId: string) {
    if (!confirm("Remove this location?")) return;
    setSavingLocation(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/agent/locations/${locationId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to remove location" });
        return;
      }
      setAgent(data.agent);
      setMessage({ type: "success", text: "Location removed." });
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSavingLocation(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 bg-[#EAE5DB] text-[#6E6455]" style={jakarta}>
        <Spinner className="h-5 w-5" />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-[#EAE5DB] px-4 py-10 sm:px-6" style={jakarta}>
        <p className="text-red-600">Could not load your agent profile. Please try logging in again.</p>
      </div>
    );
  }

  const hasRequiredDocument = Boolean(
    agent.govIdDocument || (agent.gstDocument && agent.certificateDocument)
  );

  const documentValues: Record<DocKey, AgentDoc | null | undefined> = {
    govId: agent.govIdDocument,
    tradeLicense: agent.tradeLicenseDocument,
    gstCertificate: agent.gstCertificateDocument,
    gst: agent.gstDocument,
    certificate: agent.certificateDocument,
  };
  const documentSlots = DOC_FIELDS.map((d) => documentValues[d.key]);
  const documentsUploaded = documentSlots.filter(Boolean).length;

  const completionChecks = [
    Boolean(agent.companyName),
    Boolean(agent.businessType),
    Boolean(agent.businessEmail),
    Boolean(agent.businessPhone),
    Boolean(agent.govIdType && agent.govIdNumber),
    agent.locations.length > 0,
    hasRequiredDocument,
  ];
  const completionPercent = Math.round(
    (completionChecks.filter(Boolean).length / completionChecks.length) * 100
  );

  const st = STATUS_STYLES[agent.verificationStatus] ?? STATUS_STYLES.INCOMPLETE;
  const isLive = agent.verificationStatus === "VERIFIED" && agent.isListed;

  const statusCopy: Record<string, [string, string]> = {
    INCOMPLETE: [
      "Your registration is not finished",
      "Add your business information, one location and your Government ID, then submit for verification. Nothing is public yet.",
    ],
    PENDING: [
      "Your application is under review",
      "Our team is checking your documents — typically within 2 working days. You can keep editing while the review is pending.",
    ],
    VERIFIED: [
      "You are live on UmrahJao",
      agent.locations.length > 0
        ? `Pilgrims in ${agent.locations.map((l) => l.city).filter(Boolean).join(", ")} can see your listing and call or WhatsApp you directly. Keep your numbers current.`
        : "Pilgrims can see your listing and call or WhatsApp you directly. Keep your numbers current.",
    ],
    REJECTED: [
      "Your application was rejected",
      agent.rejectionReason || 'Update your information and documents under "All Info", then submit again for review.',
    ],
  };
  const [statusHeadline, statusBody] = statusCopy[agent.verificationStatus] ?? statusCopy.INCOMPLETE;

  const checklist = [
    {
      ok: Boolean(agent.companyName && agent.businessType && agent.businessEmail && agent.businessPhone),
      text: "Business information complete",
    },
    { ok: agent.locations.length > 0, text: `At least one location added (${agent.locations.length})` },
    { ok: hasRequiredDocument, text: "Government ID Document uploaded" },
    { ok: documentsUploaded >= 4, text: `Supporting documents (${documentsUploaded} of ${documentSlots.length})` },
  ];

  const typeService = SERVICES.find((s) => s.slug === agent.businessType);

  return (
    <div className="min-h-screen bg-[#EAE5DB] px-4 py-7 sm:px-8 lg:py-9" style={jakarta}>
      <div className="mx-auto max-w-[1320px]">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="UmrahJao logo" width={36} height={36} className="h-9 w-9 rounded-xl" />
            <div>
              <div className="text-sm font-extrabold tracking-tight text-[#24201A]">UmrahJao</div>
              <div className="mt-0.5 text-[9px] font-bold tracking-[0.14em] text-[#8A7F6C]">AGENT PORTAL</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            {isLive ? (
              <Link
                href={`/agents/${agent.id}`}
                target="_blank"
                className="neu-raised-sm rounded-xl px-4 py-2.5 text-xs font-bold text-[#6E6455] hover:text-[#0E5B4A]"
              >
                View public listing
              </Link>
            ) : (
              <span
                title="Not visible on the public site yet"
                className="neu-pressed cursor-not-allowed rounded-xl px-4 py-2.5 text-xs font-bold text-[#9A907C]"
              >
                View public listing
              </span>
            )}
            <LogoutButton className="neu-raised-sm rounded-xl px-4 py-2.5 text-xs font-bold text-[#6E6455] hover:text-[#0E5B4A]" />
          </div>
        </div>

        <div className="neu-raised flex flex-wrap items-center gap-4 rounded-3xl bg-[#EAE5DB] px-6 py-5 sm:px-7">
          <div className="relative h-[68px] w-[68px] shrink-0 rounded-full">
            {agent.profileImage ? (
              <div className="relative h-full w-full overflow-hidden rounded-full">
                <Image src={agent.profileImage.url} alt="" fill className="object-cover" />
              </div>
            ) : (
              <div className="neu-pressed grid h-full w-full place-items-center rounded-full text-2xl font-extrabold text-[#0E5B4A]">
                {(agent.companyName || agent.ownerName || "?").charAt(0).toUpperCase()}
              </div>
            )}
            <label className="absolute -bottom-1 -right-1 grid h-7 w-7 cursor-pointer place-items-center rounded-full bg-[#0E5B4A] text-white ring-2 ring-[#EAE5DB]">
              {uploading === "profile" ? <Spinner className="h-3.5 w-3.5" /> : <span className="text-[11px]">✎</span>}
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                disabled={uploading === "profile"}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload("profile", file);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[21px] font-extrabold tracking-tight text-[#24201A]">
              {agent.companyName || "Your Agency"}
            </div>
            <div className="mt-1 text-[13px] text-[#7A705E]">
              {agent.ownerName} · {agent.email}
            </div>
          </div>
          <div className="text-right">
            <div className="mb-1.5 text-[10px] font-bold tracking-[0.1em] text-[#9A907C]">VERIFICATION</div>
            <span
              className="inline-block rounded-lg px-3 py-1.5 text-[11px] font-extrabold tracking-wide"
              style={{ color: st.fg, background: st.bg }}
            >
              {STATUS_LABELS[agent.verificationStatus] ?? agent.verificationStatus}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[236px_1fr]">
          <aside className="neu-raised flex flex-col gap-1.5 rounded-[22px] bg-[#EAE5DB] p-3.5 lg:sticky lg:top-6">
            {TABS.map((t) => {
              const active = t.key === tab;
              const flagged = t.key === "info" && !hasRequiredDocument;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => {
                    setMessage(null);
                    setTab(t.key);
                  }}
                  className={
                    "flex items-center gap-2.5 rounded-2xl px-4 py-3 text-left transition " +
                    (active ? "text-[#F3EFE6] shadow-sm" : "neu-raised-sm text-[#4A4238]")
                  }
                  style={active ? { background: "#06042a" } : undefined}
                >
                  <span className="w-[18px] text-center text-sm">{t.icon}</span>
                  <span className="flex-1 text-[13.5px] font-bold">{t.label}</span>
                  {flagged && <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-[#C08A2E]" />}
                </button>
              );
            })}
            <div className="my-2.5 h-px bg-[#96897640]" />
            <div className="px-3 pb-2 pt-1">
              <div className="text-[10px] font-extrabold tracking-[0.1em] text-[#9A907C]">PROFILE COMPLETION</div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-[22px] font-extrabold text-[#0E5B4A]">{completionPercent}%</span>
                <span className="text-[11px] text-[#9A907C]">complete</span>
              </div>
              <div className="neu-pressed mt-2.5 h-2 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${completionPercent}%`, background: "linear-gradient(90deg, #0E5B4A, #1C7F69)" }}
                />
              </div>
              <div className="mt-2.5 text-[11px] leading-[1.5] text-[#8A7F6C]">
                {!hasRequiredDocument
                  ? "Upload your Government ID to reach 100%."
                  : documentsUploaded < documentSlots.length
                    ? "Add the remaining documents to reach 100%."
                    : "Everything on file — nothing pending."}
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            {message && (
              <div
                className={
                  "mb-5 rounded-2xl px-5 py-3.5 text-sm font-semibold " +
                  (message.type === "success" ? "bg-[#0E5B4A]/10 text-[#0A4438]" : "bg-[#C0392B]/10 text-[#A0301F]")
                }
              >
                {message.text}
              </div>
            )}

            {tab === "dashboard" && (
              <div className="flex flex-col gap-5">
                <div
                  className="rounded-[20px] border-l-4 px-6 py-5"
                  style={{ color: st.fg, background: st.bg, borderColor: st.dot }}
                >
                  <div className="text-sm font-extrabold">{statusHeadline}</div>
                  <div className="mt-1.5 text-[12.5px] leading-[1.6] opacity-85">{statusBody}</div>
                </div>

                {agent.verificationStatus === "INCOMPLETE" && (
                  <div
                    className="flex flex-wrap items-center gap-6 rounded-[22px] px-6 py-6 sm:px-7"
                    style={{ background: "linear-gradient(145deg, #0E5B4A, #093B31)" }}
                  >
                    <div className="flex-1">
                      <div style={amiri} className="text-lg text-[#F6E2B4]">
                        أهلاً وسهلاً
                      </div>
                      <div className="mt-2 text-[19px] font-extrabold text-white">
                        New here? Complete your registration.
                      </div>
                      <div className="mt-1.5 max-w-[560px] text-[12.5px] leading-[1.6] text-white/70">
                        Add your business details, at least one location and your Government ID document —
                        then submit for verification. Pilgrims see your listing only after our team approves it.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRegisterClick}
                      className="shrink-0 rounded-2xl px-6 py-3.5 text-[13.5px] font-extrabold text-[#0A4438]"
                      style={{ background: "#F6E2B4" }}
                    >
                      Register now
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <StatCard
                    label="VERIFICATION STATUS"
                    value={STATUS_LABELS[agent.verificationStatus] ?? agent.verificationStatus}
                    color={st.dot}
                    note={agent.updatedAt ? `Updated ${new Date(agent.updatedAt).toLocaleDateString()}` : undefined}
                  />
                  <StatCard label="PROFILE COMPLETION" value={`${completionPercent}%`} note="Business info, locations, documents">
                    <div className="neu-pressed mt-2.5 h-[7px] overflow-hidden rounded-full">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${completionPercent}%`, background: "linear-gradient(90deg, #0E5B4A, #1C7F69)" }}
                      />
                    </div>
                  </StatCard>
                  <StatCard
                    label="LOCATIONS ADDED"
                    value={String(agent.locations.length)}
                    note={agent.locations.map((l) => l.city).filter(Boolean).join(" · ") || "None yet"}
                  />
                  <StatCard
                    label="DOCUMENTS UPLOADED"
                    value={`${documentsUploaded} / ${documentSlots.length}`}
                    color={hasRequiredDocument ? "#0E5B4A" : "#A0301F"}
                    note={hasRequiredDocument ? "Government ID on file" : "Government ID missing"}
                  />
                </div>

                {agent.verificationStatus !== "VERIFIED" && (
                  <div className="neu-raised rounded-[22px] bg-[#EAE5DB] p-6">
                    <div className="flex flex-wrap items-start gap-6">
                      <div className="flex-1">
                        <div className="text-base font-extrabold text-[#24201A]">Submit for Verification</div>
                        <div className="mt-1.5 max-w-[620px] text-[12.5px] leading-[1.6] text-[#7A705E]">
                          Our team checks your licence, GST and Government ID, usually within 2 working days. You
                          can keep editing while the review is pending — resubmitting resets the queue position.
                        </div>
                        <div className="mt-4 flex flex-col gap-2">
                          {checklist.map((k) => (
                            <div key={k.text} className="flex items-center gap-2.5">
                              <span
                                className="grid h-[19px] w-[19px] shrink-0 place-items-center rounded-full text-[11px] font-extrabold text-white"
                                style={{ background: k.ok ? "#0E5B4A" : "#C0392B" }}
                              >
                                {k.ok ? "✓" : "!"}
                              </span>
                              <span
                                className="text-[12.5px] font-semibold"
                                style={{ color: k.ok ? "#3A342B" : "#A0301F" }}
                              >
                                {k.text}
                              </span>
                            </div>
                          ))}
                        </div>
                        {!hasRequiredDocument && (
                          <div
                            className="mt-4 flex items-center gap-2.5 rounded-xl border-l-[3px] px-3.5 py-3"
                            style={{ background: "rgba(192,57,43,.09)", borderColor: "#C0392B" }}
                          >
                            <span className="text-xs font-bold text-[#A0301F]">
                              Government ID Document is required before you can submit.
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex min-w-[200px] flex-none flex-col gap-2.5">
                        <button
                          type="button"
                          onClick={handleSubmitVerification}
                          disabled={!hasRequiredDocument || submitting}
                          className={
                            "flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-[13.5px] font-extrabold transition " +
                            (!hasRequiredDocument
                              ? "neu-pressed cursor-not-allowed text-[#A9A08C]"
                              : "text-[#F3EFE6]")
                          }
                          style={
                            hasRequiredDocument
                              ? { background: "#06042a", opacity: submitting ? 0.75 : 1 }
                              : undefined
                          }
                        >
                          {submitting && <Spinner className="h-3.5 w-3.5" />}
                          {submitting
                            ? "Submitting…"
                            : !hasRequiredDocument
                              ? "Upload ID to submit"
                              : "Submit for Verification"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setTab("info")}
                          className="neu-raised-sm flex items-center justify-center rounded-2xl px-4 py-3 text-[12.5px] font-bold text-[#6E6455]"
                        >
                          Edit my information
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === "info" && (
              <div className="flex flex-col gap-5">
                <div className="neu-raised rounded-[22px] bg-[#EAE5DB] p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-base font-extrabold text-[#24201A]">Business Information</div>
                      <div className="mt-1 text-xs text-[#8A7F6C]">Shown on your public profile card.</div>
                    </div>
                    <div className="flex gap-2.5">
                      {editingBusinessInfo && (
                        <button
                          type="button"
                          onClick={handleSaveBusinessInfoSection}
                          disabled={saving}
                          className="flex items-center gap-2 rounded-xl px-[18px] py-2.5 text-[12.5px] font-extrabold text-[#F3EFE6]"
                          style={{ background: "#06042a", opacity: saving ? 0.75 : 1 }}
                        >
                          {saving && <Spinner className="h-3.5 w-3.5" />}
                          {saving ? "Saving…" : "Save changes"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          editingBusinessInfo ? handleCancelBusinessInfoSection() : setEditingBusinessInfo(true)
                        }
                        className="neu-raised-sm rounded-xl px-[18px] py-2.5 text-[12.5px] font-bold text-[#6E6455]"
                      >
                        {editingBusinessInfo ? "Cancel" : "Edit section"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <BizField
                      label="Company Name"
                      editing={editingBusinessInfo}
                      value={profile.companyName}
                      shown={agent.companyName}
                      placeholder="Al-Safar Travels"
                      onChange={(v) => setProfile({ ...profile, companyName: v })}
                    />
                    <div>
                      <div className="mb-[7px] text-[11px] font-bold text-[#6E6455]">Business Type</div>
                      {editingBusinessInfo ? (
                        <select
                          className="w-full rounded-xl border-none bg-[#EAE5DB] px-3.5 py-3 text-[13px] font-semibold text-[#24201A] outline-none neu-pressed"
                          value={profile.businessType}
                          onChange={(e) => setProfile({ ...profile, businessType: e.target.value })}
                        >
                          <option value="" disabled>
                            Select Business Type
                          </option>
                          {SERVICES.map((s) => (
                            <option key={s.slug} value={s.slug}>
                              {s.icon} {s.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="px-0 py-[3px] text-[13.5px] font-bold text-[#3A342B]">
                          {typeService ? `${typeService.icon} ${typeService.label}` : agent.businessType || "—"}
                        </div>
                      )}
                    </div>
                    <BizField
                      label="Business Email"
                      editing={editingBusinessInfo}
                      value={profile.businessEmail}
                      shown={agent.businessEmail}
                      placeholder="office@agency.in"
                      quick="Use account email"
                      onQuick={() => setProfile({ ...profile, businessEmail: agent.email })}
                      onChange={(v) => setProfile({ ...profile, businessEmail: v })}
                    />
                    <BizField
                      label="Business Phone"
                      editing={editingBusinessInfo}
                      value={profile.businessPhone}
                      shown={agent.businessPhone}
                      placeholder="+91 40 0000 0000"
                      quick="Use account phone"
                      onQuick={() => setProfile({ ...profile, businessPhone: agent.mobileNumber })}
                      onChange={(v) => setProfile({ ...profile, businessPhone: v })}
                    />
                    <BizField
                      label="Experience (years)"
                      editing={editingBusinessInfo}
                      value={profile.experienceYears}
                      shown={agent.experienceYears != null ? `${agent.experienceYears} years` : ""}
                      type="number"
                      onChange={(v) => setProfile({ ...profile, experienceYears: v })}
                    />
                    <BizField
                      label="Total Bookings"
                      editing={editingBusinessInfo}
                      value={profile.totalBookings}
                      shown={agent.totalBookings != null ? agent.totalBookings.toLocaleString("en-IN") : ""}
                      type="number"
                      onChange={(v) => setProfile({ ...profile, totalBookings: v })}
                    />
                    <BizField
                      label="Starting Package Price (₹)"
                      editing={editingBusinessInfo}
                      value={profile.startingPrice}
                      shown={agent.startingPrice != null ? `₹${agent.startingPrice.toLocaleString("en-IN")}` : ""}
                      type="number"
                      onChange={(v) => setProfile({ ...profile, startingPrice: v })}
                    />
                    <BizField
                      label="GST Number"
                      editing={editingBusinessInfo}
                      value={profile.gstNumber}
                      shown={agent.gstNumber}
                      placeholder="36AAAAA0000A1Z5"
                      onChange={(v) => setProfile({ ...profile, gstNumber: v })}
                    />
                    <div>
                      <div className="mb-[7px] text-[11px] font-bold text-[#6E6455]">Government ID Type</div>
                      {editingBusinessInfo ? (
                        <select
                          className="w-full rounded-xl border-none bg-[#EAE5DB] px-3.5 py-3 text-[13px] font-semibold text-[#24201A] outline-none neu-pressed"
                          value={profile.govIdType}
                          onChange={(e) => setProfile({ ...profile, govIdType: e.target.value })}
                        >
                          <option value="" disabled>
                            Select ID Type
                          </option>
                          {GOVERNMENT_ID_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="px-0 py-[3px] text-[13.5px] font-bold text-[#3A342B]">
                          {agent.govIdType || "—"}
                        </div>
                      )}
                    </div>
                    <BizField
                      label="Government ID Number"
                      editing={editingBusinessInfo}
                      value={profile.govIdNumber}
                      shown={agent.govIdNumber}
                      onChange={(v) => setProfile({ ...profile, govIdNumber: v })}
                    />
                  </div>
                </div>

                <div className="neu-raised rounded-[22px] bg-[#EAE5DB] p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-base font-extrabold text-[#24201A]">Locations</div>
                      <div className="mt-1 text-xs text-[#8A7F6C]">
                        Pilgrims filter by city — add every office you operate from.
                      </div>
                    </div>
                    {!locationDraft && (
                      <button
                        type="button"
                        onClick={startAddLocation}
                        disabled={agent.locations.length >= 10}
                        className="flex items-center gap-2 rounded-xl px-[18px] py-2.5 text-[12.5px] font-extrabold text-[#F3EFE6] disabled:opacity-50"
                        style={{ background: "#06042a" }}
                      >
                        + Add location
                      </button>
                    )}
                  </div>

                  <div className="mt-4 flex flex-col gap-3.5">
                    {agent.locations.length === 0 && !locationDraft && (
                      <p className="text-sm italic text-[#8A7F6C]">No locations added yet.</p>
                    )}
                    {agent.locations.map((location) => (
                      <div key={location.id}>
                        <div className="neu-pressed rounded-[18px] p-[18px]">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <div className="text-[14.5px] font-extrabold text-[#24201A]">
                                {[location.city, location.state].filter(Boolean).join(", ") || "Untitled location"}
                              </div>
                              <div className="mt-1 text-xs leading-[1.55] text-[#8A7F6C]">
                                {location.address}
                                {location.address && <br />}
                                {[location.country, location.pincode].filter(Boolean).join(" · ")}
                              </div>
                            </div>
                            <div className="flex flex-none gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  locationDraft?.id === location.id
                                    ? setLocationDraft(null)
                                    : startEditLocation(location)
                                }
                                className="neu-raised-sm rounded-[10px] px-3.5 py-2 text-[11.5px] font-bold text-[#4A4238]"
                              >
                                {locationDraft?.id === location.id ? "Done" : "Edit"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteLocation(location.id)}
                                disabled={savingLocation}
                                className="rounded-[10px] border-[1.5px] px-3 py-2 text-[11.5px] font-bold text-[#C0392B] disabled:opacity-50"
                                style={{ borderColor: "rgba(192,57,43,.45)" }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          {location.services.length > 0 && (
                            <>
                              <div className="mt-4 text-[10px] font-extrabold tracking-[0.1em] text-[#8A7F6C]">
                                SERVICES OFFERED HERE
                              </div>
                              <div className="mt-2.5 flex flex-wrap gap-2">
                                {location.services.map((slug) => {
                                  const svc = SERVICES.find((s) => s.slug === slug);
                                  return (
                                    <span
                                      key={slug}
                                      className="neu-raised-sm flex items-center gap-1.5 rounded-[11px] px-3 py-2 text-[11.5px] font-bold text-[#6E6455]"
                                    >
                                      <span className="text-[13px]">{svc?.icon}</span>
                                      {getServiceLabel(slug)}
                                    </span>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>

                        {locationDraft?.id === location.id && (
                          <LocationEditor
                            draft={locationDraft}
                            cities={cities}
                            saving={savingLocation}
                            onChange={setLocationDraft}
                            onToggleService={toggleDraftService}
                            onSave={handleSaveLocation}
                            onCancel={() => setLocationDraft(null)}
                          />
                        )}
                      </div>
                    ))}

                    {locationDraft && locationDraft.id === null && (
                      <LocationEditor
                        draft={locationDraft}
                        cities={cities}
                        saving={savingLocation}
                        isNew
                        onChange={setLocationDraft}
                        onToggleService={toggleDraftService}
                        onSave={handleSaveLocation}
                        onCancel={() => setLocationDraft(null)}
                      />
                    )}
                  </div>
                </div>

                <div className="neu-raised rounded-[22px] bg-[#EAE5DB] p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-base font-extrabold text-[#24201A]">Documents</div>
                      <div className="mt-1 text-xs text-[#8A7F6C]">
                        Only our verification team sees these — never shown publicly.
                      </div>
                    </div>
                    <div className="text-xs font-bold text-[#6E6455]">
                      {documentsUploaded} of {documentSlots.length} core documents uploaded
                    </div>
                  </div>

                  <div className="mt-[18px] grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                    {DOC_FIELDS.map((d) => {
                      const uploaded = documentValues[d.key];
                      const bad = d.required && !uploaded;
                      const busy = uploading === d.key;
                      return (
                        <label
                          key={d.key}
                          className={
                            "block cursor-pointer rounded-2xl p-4 transition " +
                            (uploaded ? "neu-raised-sm" : bad ? "border-[1.5px] border-dashed" : "neu-pressed")
                          }
                          style={
                            !uploaded
                              ? { background: bad ? "rgba(192,57,43,.06)" : undefined, borderColor: bad ? "rgba(192,57,43,.45)" : undefined }
                              : undefined
                          }
                        >
                          <div className="flex items-center justify-between gap-2.5">
                            <span className="text-[12.5px] font-extrabold text-[#24201A]">{d.label}</span>
                            <span
                              className="rounded-md px-2 py-1 text-[9.5px] font-extrabold tracking-wide"
                              style={{
                                color: uploaded ? "#0A4438" : bad ? "#A0301F" : "#8A7F6C",
                                background: uploaded ? "rgba(14,91,74,.14)" : bad ? "rgba(192,57,43,.12)" : "rgba(120,110,95,.14)",
                              }}
                            >
                              {busy ? "…" : uploaded ? "UPLOADED" : bad ? "REQUIRED" : "UPLOAD"}
                            </span>
                          </div>
                          <div className="mt-2 text-[11px] leading-[1.5] text-[#9A907C]">
                            {uploaded ? "Uploaded — click to replace." : d.note}
                          </div>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                            className="hidden"
                            disabled={busy}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUpload(d.key, file);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      );
                    })}
                  </div>

                  <div className="my-5 h-px bg-gradient-to-r from-[#96897650] to-white/95" />
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-[13px] font-extrabold text-[#24201A]">Additional documents</div>
                      <div className="mt-0.5 text-[11.5px] text-[#8A7F6C]">
                        Up to 5 extra files with your own labels — quota letters, hotel contracts, awards.
                      </div>
                    </div>
                  </div>
                  <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
                    {agent.additionalDocuments?.map((doc) => (
                      <div key={doc.publicId} className="neu-pressed flex items-center gap-2 rounded-xl px-3.5 py-2.5">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-[#3A342B] hover:text-[#0E5B4A]"
                        >
                          {doc.name || "Document"}
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemoveAdditionalDocument(doc.publicId)}
                          className="text-[11px] font-extrabold text-[#C0392B]"
                          aria-label="Remove document"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2.5">
                    <input
                      value={addDocLabel}
                      onChange={(e) => setAddDocLabel(e.target.value)}
                      disabled={(agent.additionalDocuments?.length ?? 0) >= 5}
                      placeholder="Document label (optional)"
                      className="neu-pressed min-w-0 flex-1 rounded-xl border-none bg-[#EAE5DB] px-3.5 py-2.5 text-xs font-semibold text-[#24201A] outline-none disabled:opacity-50"
                    />
                    <label
                      className={
                        "neu-raised-sm shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold text-[#0E5B4A] " +
                        ((agent.additionalDocuments?.length ?? 0) >= 5 || uploading === "additional"
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer")
                      }
                    >
                      {uploading === "additional" ? "Uploading…" : "+ Add document"}
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        className="hidden"
                        disabled={(agent.additionalDocuments?.length ?? 0) >= 5 || uploading === "additional"}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUpload("additional", file, addDocLabel);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>

                  {agent.verificationStatus === "PENDING" ? (
                    <div className="mt-5 rounded-xl px-5 py-4" style={{ background: "rgba(192,138,46,.14)", color: "#8A5A12" }}>
                      <p className="font-semibold">Your verification request is under review.</p>
                      <p className="mt-1 text-sm opacity-80">
                        Our team will review your documents and notify you here once verified.
                      </p>
                    </div>
                  ) : agent.verificationStatus !== "VERIFIED" ? (
                    <div className="mt-5">
                      <button
                        type="button"
                        onClick={handleSubmitVerification}
                        disabled={submitting}
                        className="inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-[13.5px] font-extrabold text-[#F3EFE6] disabled:cursor-not-allowed"
                        style={{ background: "#06042a", opacity: submitting ? 0.6 : 1 }}
                      >
                        {submitting && <Spinner className="h-4 w-4" />}
                        {submitting ? "Applying..." : "Apply for Verification"}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {tab === "subscription" && (
              <div className="neu-inset rounded-3xl px-8 py-16 text-center">
                <div className="neu-raised mx-auto grid h-16 w-16 place-items-center rounded-[20px] bg-[#EAE5DB]">
                  <span style={amiri} className="text-2xl text-[#0E5B4A]">
                    ص
                  </span>
                </div>
                <div className="mt-5 text-xl font-extrabold text-[#24201A]">Subscriptions are coming soon</div>
                <p className="mx-auto mt-2.5 max-w-[460px] text-[13px] leading-[1.65] text-[#7A705E]">
                  Your listing is free and stays free. Later this year you&apos;ll be able to boost your placement
                  in city searches and see who viewed your number.
                </p>
                <div
                  className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold"
                  style={{ color: "#8A5A12", background: "rgba(192,138,46,.16)" }}
                >
                  <span className="h-[7px] w-[7px] rounded-full bg-[#C08A2E]" />
                  Notify me when it launches
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {submitSuccess && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-[#14201C]/55 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-[440px] rounded-[26px] bg-[#EAE5DB] p-9 text-center shadow-2xl">
            <div
              className="mx-auto grid h-[68px] w-[68px] place-items-center rounded-full"
              style={{ background: "#06042a" }}
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#F6E2B4" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12.5l5 5L20 6.5" />
              </svg>
            </div>
            <div className="mt-5 text-[21px] font-extrabold text-[#24201A]">Submitted for Verification.</div>
            <p className="mt-2.5 text-[13px] leading-[1.65] text-[#7A705E]">
              Our team will review {agent.companyName || "your business"} within 2 working days. We&apos;ll email{" "}
              {agent.email} as soon as there&apos;s a decision.
            </p>
            <button
              type="button"
              onClick={() => setSubmitSuccess(false)}
              className="mt-6 w-full rounded-2xl py-3.5 text-[13.5px] font-extrabold text-[#F3EFE6]"
              style={{ background: "#06042a" }}
            >
              Back to dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  note,
  children,
}: {
  label: string;
  value: string;
  color?: string;
  note?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="neu-raised rounded-[20px] bg-[#EAE5DB] p-[19px]">
      <div className="text-[10.5px] font-extrabold tracking-[0.08em] text-[#8A7F6C]">{label}</div>
      <div className="mt-2.5 text-[26px] font-extrabold tracking-tight" style={{ color: color ?? "#24201A" }}>
        {value}
      </div>
      {children}
      {note && <div className="mt-2 text-[11px] text-[#9A907C]">{note}</div>}
    </div>
  );
}

function BizField({
  label,
  editing,
  value,
  shown,
  placeholder,
  type,
  quick,
  onQuick,
  onChange,
}: {
  label: string;
  editing: boolean;
  value: string;
  shown: string | null | undefined;
  placeholder?: string;
  type?: string;
  quick?: string;
  onQuick?: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <div className="mb-[7px] flex items-baseline justify-between">
        <span className="text-[11px] font-bold text-[#6E6455]">{label}</span>
        {editing && quick && (
          <button type="button" onClick={onQuick} className="text-[10.5px] font-bold text-[#0E5B4A]">
            {quick}
          </button>
        )}
      </div>
      {editing ? (
        <input
          type={type ?? "text"}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="neu-pressed w-full rounded-xl border-none bg-[#EAE5DB] px-3.5 py-3 text-[13px] font-semibold text-[#24201A] outline-none"
        />
      ) : (
        <div className="px-0 py-[3px] text-[13.5px] font-bold text-[#3A342B]">{shown || "—"}</div>
      )}
    </div>
  );
}

function LocationEditor({
  draft,
  cities,
  saving,
  isNew,
  onChange,
  onToggleService,
  onSave,
  onCancel,
}: {
  draft: typeof emptyLocationDraft & { id: string | null };
  cities: string[];
  saving: boolean;
  isNew?: boolean;
  onChange: (draft: typeof emptyLocationDraft & { id: string | null }) => void;
  onToggleService: (slug: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="neu-pressed mt-3.5 rounded-[18px] p-[18px]">
      {isNew && <div className="mb-3.5 text-[13px] font-extrabold text-[#24201A]">Add Location</div>}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <LocEditField label="Country">
          <select
            className={selectClass}
            value={draft.country}
            onChange={(e) => onChange({ ...draft, country: e.target.value })}
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </LocEditField>
        <LocEditField label="State">
          <select
            className={selectClass}
            value={draft.state}
            onChange={(e) => onChange({ ...draft, state: e.target.value, city: "" })}
          >
            <option value="" disabled>
              Select state
            </option>
            {INDIA_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </LocEditField>
        <LocEditField label="City">
          <select
            className={selectClass}
            disabled={!draft.state}
            value={draft.city}
            onChange={(e) => onChange({ ...draft, city: e.target.value })}
          >
            <option value="" disabled>
              {draft.state ? "Select city" : "Select a state first"}
            </option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </LocEditField>
        <LocEditField label="Pincode">
          <input
            className={inputClass}
            value={draft.pincode}
            onChange={(e) => onChange({ ...draft, pincode: e.target.value.replace(/[^0-9]/g, "") })}
          />
        </LocEditField>
      </div>
      <div className="mt-3">
        <Field label="Address (Optional)">
          <textarea
            rows={2}
            className={inputClass}
            value={draft.address}
            onChange={(e) => onChange({ ...draft, address: e.target.value })}
          />
        </Field>
      </div>

      <div className="mt-4 text-[10px] font-extrabold tracking-[0.1em] text-[#8A7F6C]">SERVICES OFFERED HERE</div>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {SERVICES.map((service) => {
          const active = draft.services.includes(service.slug);
          return (
            <button
              key={service.slug}
              type="button"
              onClick={() => onToggleService(service.slug)}
              className={
                "flex items-center gap-1.5 rounded-[11px] px-3 py-2 text-[11.5px] font-bold transition " +
                (active ? "text-[#F3EFE6]" : "neu-raised-sm text-[#6E6455]")
              }
              style={active ? { background: "#06042a" } : undefined}
            >
              <span className="text-[13px]">{service.icon}</span>
              {service.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex gap-2.5">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12.5px] font-extrabold text-[#F3EFE6] disabled:opacity-60"
          style={{ background: "#06042a" }}
        >
          {saving && <Spinner className="h-3.5 w-3.5" />}
          {saving ? "Saving..." : "Save Location"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="neu-raised-sm rounded-xl px-4 py-2.5 text-[12.5px] font-bold text-[#4A4238] disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function LocEditField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-[6px] text-[10.5px] font-bold text-[#6E6455]">{label}</div>
      {children}
    </div>
  );
}
