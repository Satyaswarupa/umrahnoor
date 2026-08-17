"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Field, inputClass, selectClass } from "@/components/form";
import Spinner from "@/components/Spinner";
import StatusBadge from "@/components/StatusBadge";
import SuccessOverlay from "@/components/SuccessOverlay";
import { COUNTRIES, INDIA_STATES, getCitiesForState } from "@/lib/locations";
import { BUSINESS_TYPES, GOVERNMENT_ID_TYPES } from "@/lib/agent-options";
import { SERVICES, getServiceLabel } from "@/lib/services";
import type { AgentLocation, PrivateAgent } from "@/lib/types";

const TABS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "info", label: "All Info" },
  { key: "subscription", label: "Subscription" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

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
    file: File
  ) {
    setUploading(type);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.set("type", type);
      formData.set("file", file);
      const res = await fetch("/api/agent/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Upload failed" });
        return;
      }
      await loadAgent();
      setMessage({ type: "success", text: "Uploaded successfully." });
    } catch {
      setMessage({ type: "error", text: "Network error during upload." });
    } finally {
      setUploading(null);
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
      setMessage({
        type: "success",
        text: "Your documents have been submitted successfully. Our team will review your information and you will be notified here once your company is verified and listed on UmrahChal.",
      });
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
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-24 text-emerald-900/60 sm:px-6">
        <Spinner className="h-5 w-5" />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p className="text-red-600">Could not load your agent profile. Please try logging in again.</p>
      </div>
    );
  }

  const hasRequiredDocument = Boolean(
    agent.govIdDocument || (agent.gstDocument && agent.certificateDocument)
  );

  const documentSlots = [
    agent.govIdDocument,
    agent.tradeLicenseDocument,
    agent.gstCertificateDocument,
    agent.gstDocument,
    agent.certificateDocument,
  ];
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white px-6 py-6 shadow-sm ring-1 ring-emerald-900/10 sm:px-8">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-emerald-50 ring-1 ring-emerald-900/10">
            {agent.profileImage ? (
              <Image src={agent.profileImage.url} alt="" fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-emerald-900/30">
                {agent.companyName?.charAt(0).toUpperCase() || agent.ownerName?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-emerald-950">{agent.companyName || "Your Agency"}</h1>
            <p className="mt-0.5 text-sm text-emerald-900/60">{agent.ownerName}</p>
          </div>
        </div>
        <StatusBadge status={agent.verificationStatus} />
      </div>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <aside className="lg:w-72 lg:shrink-0">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-emerald-900/10 lg:sticky lg:top-8">
            <p className="px-2 text-xs font-semibold uppercase tracking-wide text-emerald-900/40">Menu</p>
            <nav className="mt-3 space-y-2">
              {TABS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setMessage(null);
                    setTab(key);
                  }}
                  className={`flex w-full items-center rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                    key === tab
                      ? "bg-emerald-800 text-white shadow-sm"
                      : "text-emerald-900/70 hover:bg-emerald-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-8">
          {message && (
            <div
              className={`rounded-xl px-5 py-4 text-sm ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/20"
                  : "bg-red-50 text-red-700 ring-1 ring-red-600/20"
              }`}
            >
              {message.text}
            </div>
          )}

          {tab === "dashboard" && (
            <div className="space-y-8">
              <StatusBanner agent={agent} />

              {agent.verificationStatus === "INCOMPLETE" && (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-emerald-800 px-6 py-6 text-white shadow-sm sm:px-8">
                  <div>
                    <p className="text-lg font-semibold">New here? Complete your registration.</p>
                    <p className="mt-1 text-sm text-emerald-50/80">
                      Fill in your business information, locations, and documents to get listed on
                      UmrahChal.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRegisterClick}
                    className="shrink-0 rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-800 shadow-sm hover:bg-emerald-50"
                  >
                    Register
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Verification Status" value={STATUS_LABELS[agent.verificationStatus] ?? agent.verificationStatus} accent="emerald" />
                <StatCard label="Profile Completion" value={`${completionPercent}%`} accent="sky">
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-sky-100">
                    <div
                      className="h-full rounded-full bg-sky-600 transition-all"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                </StatCard>
                <StatCard label="Locations Added" value={String(agent.locations.length)} accent="amber" />
                <StatCard label="Documents Uploaded" value={`${documentsUploaded} / ${documentSlots.length}`} accent="violet" />
              </div>

              {agent.verificationStatus !== "VERIFIED" && (
                <Section title="Submit for Verification">
                  <p className="text-sm text-emerald-900/60">
                    Once your business info and required documents are complete, submit your profile for
                    review by the UmrahChal team.
                  </p>
                  {!hasRequiredDocument && (
                    <p className="mt-3 text-xs text-amber-700">
                      Upload your Government ID Document under "All Info" before submitting — it's the
                      only required document.
                    </p>
                  )}
                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={handleSubmitVerification}
                      disabled={submitting}
                      className="inline-flex items-center gap-2 rounded-full bg-emerald-800 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting && <Spinner className="h-4 w-4" />}
                      {submitting ? "Submitting..." : "Submit for Verification"}
                    </button>
                  </div>
                </Section>
              )}
            </div>
          )}

          {tab === "info" && (
            <div className="space-y-8">
              <Section title="Business Profile">
                <div className="flex items-center gap-5">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-emerald-50 ring-1 ring-emerald-900/10">
                    {agent.profileImage ? (
                      <Image src={agent.profileImage.url} alt="Business profile" fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl text-emerald-900/30">
                        {agent.companyName?.charAt(0).toUpperCase() || agent.ownerName?.charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                    {uploading === "profile" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-emerald-950/40 text-white">
                        <Spinner className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-950">{agent.ownerName}</p>
                    <p className="text-xs text-emerald-900/60">{agent.email}</p>
                    <div className="mt-2">
                      <UploadButton
                        uploading={uploading === "profile"}
                        label={agent.profileImage ? "Replace Photo" : "Upload Photo"}
                        accept=".jpg,.jpeg,.png,.webp"
                        onUpload={(file) => handleUpload("profile", file)}
                      />
                    </div>
                  </div>
                </div>
              </Section>

              <Section
                title="Business Information"
                headerAction={
                  !editingBusinessInfo && (
                    <button
                      type="button"
                      onClick={() => setEditingBusinessInfo(true)}
                      className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
                    >
                      Edit
                    </button>
                  )
                }
              >
                {editingBusinessInfo ? (
                  <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Company Name *">
                        <input
                          required
                          className={inputClass}
                          value={profile.companyName}
                          onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                        />
                      </Field>
                      <Field label="Business Type *">
                        <select
                          required
                          className={selectClass}
                          value={profile.businessType}
                          onChange={(e) => setProfile({ ...profile, businessType: e.target.value })}
                        >
                          <option value="" disabled>
                            Select Business Type
                          </option>
                          {BUSINESS_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <div>
                        <Field label="Business Email *">
                          <input
                            required
                            type="email"
                            className={inputClass}
                            placeholder={agent.email}
                            value={profile.businessEmail}
                            onChange={(e) => setProfile({ ...profile, businessEmail: e.target.value })}
                          />
                        </Field>
                        <button
                          type="button"
                          onClick={() => setProfile({ ...profile, businessEmail: agent.email })}
                          className="mt-1 text-xs font-medium text-emerald-700 hover:text-emerald-800"
                        >
                          Use account email
                        </button>
                      </div>
                      <div>
                        <Field label="Business Phone *">
                          <input
                            required
                            className={inputClass}
                            placeholder={agent.mobileNumber}
                            value={profile.businessPhone}
                            onChange={(e) => setProfile({ ...profile, businessPhone: e.target.value })}
                          />
                        </Field>
                        <button
                          type="button"
                          onClick={() => setProfile({ ...profile, businessPhone: agent.mobileNumber })}
                          className="mt-1 text-xs font-medium text-emerald-700 hover:text-emerald-800"
                        >
                          Use account phone
                        </button>
                      </div>
                      <Field label="Experience (Years)">
                        <input
                          type="number"
                          min={0}
                          max={80}
                          className={inputClass}
                          placeholder="e.g. 5"
                          value={profile.experienceYears}
                          onChange={(e) => setProfile({ ...profile, experienceYears: e.target.value })}
                        />
                      </Field>
                      <Field label="Total Bookings">
                        <input
                          type="number"
                          min={0}
                          className={inputClass}
                          placeholder="e.g. 120"
                          value={profile.totalBookings}
                          onChange={(e) => setProfile({ ...profile, totalBookings: e.target.value })}
                        />
                      </Field>
                      <Field label="Starting Package Price (₹)">
                        <input
                          type="number"
                          min={0}
                          className={inputClass}
                          placeholder="e.g. 85000"
                          value={profile.startingPrice}
                          onChange={(e) => setProfile({ ...profile, startingPrice: e.target.value })}
                        />
                      </Field>
                      <Field label="GST Number (Optional)">
                        <input
                          className={inputClass}
                          placeholder="Enter 15-digit GST number"
                          value={profile.gstNumber}
                          onChange={(e) => setProfile({ ...profile, gstNumber: e.target.value })}
                        />
                      </Field>
                      <Field label="Government ID Type *">
                        <select
                          required
                          className={selectClass}
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
                      </Field>
                      <Field label="Government ID Number *">
                        <input
                          required
                          className={inputClass}
                          placeholder="Enter ID number"
                          value={profile.govIdNumber}
                          onChange={(e) => setProfile({ ...profile, govIdNumber: e.target.value })}
                        />
                      </Field>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={handleSaveBusinessInfoSection}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {saving && <Spinner className="h-4 w-4" />}
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelBusinessInfoSection}
                        disabled={saving}
                        className="rounded-lg border border-emerald-900/15 px-4 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                    <PreviewItem label="Company Name" value={agent.companyName} />
                    <PreviewItem label="Business Type" value={agent.businessType} />
                    <PreviewItem label="Business Email" value={agent.businessEmail} />
                    <PreviewItem label="Business Phone" value={agent.businessPhone} />
                    <PreviewItem
                      label="Experience"
                      value={agent.experienceYears != null ? `${agent.experienceYears} years` : ""}
                    />
                    <PreviewItem
                      label="Total Bookings"
                      value={agent.totalBookings != null ? String(agent.totalBookings) : ""}
                    />
                    <PreviewItem
                      label="Starting Package Price"
                      value={agent.startingPrice != null ? `₹${agent.startingPrice.toLocaleString("en-IN")}` : ""}
                    />
                    <PreviewItem label="GST Number" value={agent.gstNumber} />
                    <PreviewItem
                      label="Government ID"
                      value={[agent.govIdType, agent.govIdNumber].filter(Boolean).join(" · ")}
                    />
                  </div>
                )}
              </Section>

              <Section title="Locations">
                <p className="text-sm text-emerald-900/60">
                  Add every city or state you serve. Each location has its own address and services —
                  pilgrims searching any of these locations will find you.
                </p>

                <div className="mt-5 space-y-4">
                  {agent.locations.length === 0 && (
                    <p className="text-sm italic text-emerald-900/50">No locations added yet.</p>
                  )}
                  {agent.locations.map((location) => (
                    <div
                      key={location.id}
                      className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-emerald-900/10 p-4"
                    >
                      <div>
                        <p className="text-sm font-semibold text-emerald-950">
                          {[location.city, location.state, location.country].filter(Boolean).join(", ") || "Untitled location"}
                        </p>
                        {location.address && <p className="mt-1 text-xs text-emerald-900/60">{location.address}</p>}
                        {location.services.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {location.services.map((slug) => (
                              <span
                                key={slug}
                                className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800 ring-1 ring-emerald-600/20"
                              >
                                {getServiceLabel(slug)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEditLocation(location)}
                          className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLocation(location.id)}
                          disabled={savingLocation}
                          className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {locationDraft ? (
                  <div className="mt-5 rounded-xl border border-emerald-600/30 bg-emerald-50/40 p-4">
                    <p className="text-sm font-semibold text-emerald-950">
                      {locationDraft.id ? "Edit Location" : "Add Location"}
                    </p>
                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Country">
                        <select
                          className={selectClass}
                          value={locationDraft.country}
                          onChange={(e) => setLocationDraft({ ...locationDraft, country: e.target.value })}
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="State">
                        <select
                          className={selectClass}
                          value={locationDraft.state}
                          onChange={(e) => setLocationDraft({ ...locationDraft, state: e.target.value, city: "" })}
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
                      </Field>
                      <Field label="City">
                        <select
                          className={selectClass}
                          disabled={!locationDraft.state}
                          value={locationDraft.city}
                          onChange={(e) => setLocationDraft({ ...locationDraft, city: e.target.value })}
                        >
                          <option value="" disabled>
                            {locationDraft.state ? "Select city" : "Select a state first"}
                          </option>
                          {cities.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Pincode">
                        <input
                          className={inputClass}
                          placeholder="Pincode"
                          value={locationDraft.pincode}
                          onChange={(e) =>
                            setLocationDraft({ ...locationDraft, pincode: e.target.value.replace(/[^0-9]/g, "") })
                          }
                        />
                      </Field>
                      <div className="sm:col-span-2">
                        <Field label="Address (Optional)">
                          <textarea
                            rows={2}
                            className={inputClass}
                            value={locationDraft.address}
                            onChange={(e) => setLocationDraft({ ...locationDraft, address: e.target.value })}
                          />
                        </Field>
                      </div>
                    </div>

                    <p className="mt-4 text-xs font-medium uppercase tracking-wide text-emerald-900/50">
                      Services at this location
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                      {SERVICES.map((service) => {
                        const active = locationDraft.services.includes(service.slug);
                        return (
                          <button
                            key={service.slug}
                            type="button"
                            onClick={() => toggleDraftService(service.slug)}
                            className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-center transition ${
                              active
                                ? "border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600/30"
                                : "border-emerald-900/10 bg-white hover:border-emerald-600/30"
                            }`}
                          >
                            <span className="text-lg">{service.icon}</span>
                            <span className="text-[11px] font-medium text-emerald-950">{service.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={handleSaveLocation}
                        disabled={savingLocation}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {savingLocation && <Spinner className="h-4 w-4" />}
                        {savingLocation ? "Saving..." : "Save Location"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setLocationDraft(null)}
                        disabled={savingLocation}
                        className="rounded-lg border border-emerald-900/15 px-4 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={startAddLocation}
                    disabled={agent.locations.length >= 10}
                    className="mt-5 rounded-lg border border-dashed border-emerald-600/40 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                  >
                    + Add Location
                  </button>
                )}
              </Section>

              <Section title="Documents & Verification">
                <p className="text-sm text-emerald-900/60">
                  Accepted formats: PDF, JPG, PNG, WEBP. Maximum size 5MB. Documents are private and are
                  only visible to you and the UmrahChal verification team.
                </p>

                <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <DocumentUploader
                    label="Government ID Document"
                    required
                    uploaded={agent.govIdDocument}
                    uploading={uploading === "govId"}
                    onUpload={(file) => handleUpload("govId", file)}
                  />
                  <DocumentUploader
                    label="Trade License"
                    uploaded={agent.tradeLicenseDocument}
                    uploading={uploading === "tradeLicense"}
                    onUpload={(file) => handleUpload("tradeLicense", file)}
                  />
                  <DocumentUploader
                    label="GST Certificate"
                    uploaded={agent.gstCertificateDocument}
                    uploading={uploading === "gstCertificate"}
                    onUpload={(file) => handleUpload("gstCertificate", file)}
                  />
                  <DocumentUploader
                    label="GST Document"
                    uploaded={agent.gstDocument}
                    uploading={uploading === "gst"}
                    onUpload={(file) => handleUpload("gst", file)}
                  />
                  <DocumentUploader
                    label="Verified Certificate"
                    uploaded={agent.certificateDocument}
                    uploading={uploading === "certificate"}
                    onUpload={(file) => handleUpload("certificate", file)}
                  />
                </div>

                <div className="mt-6">
                  <p className="text-sm font-medium text-emerald-950">
                    Additional Documents{" "}
                    <span className="font-normal text-emerald-900/50">(optional, up to 5)</span>
                  </p>
                  <ul className="mt-2 space-y-1">
                    {agent.additionalDocuments?.map((doc) => (
                      <li key={doc.publicId} className="text-sm text-emerald-800">
                        &bull; {doc.name || "Document"}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3">
                    <UploadButton
                      uploading={uploading === "additional"}
                      disabled={(agent.additionalDocuments?.length ?? 0) >= 5}
                      label="Upload Additional Document"
                      onUpload={(file) => handleUpload("additional", file)}
                    />
                  </div>
                </div>

                <p className="mt-4 text-xs text-emerald-900/50">
                  Only the Government ID Document is required. All other documents are optional.
                </p>
                {!hasRequiredDocument && (
                  <p className="mt-1 text-xs text-amber-700">
                    Upload your Government ID Document to get verified.
                  </p>
                )}

                {agent.verificationStatus === "PENDING" ? (
                  <div className="mt-5 rounded-xl bg-amber-50 px-5 py-4 text-amber-900 ring-1 ring-amber-600/20">
                    <p className="font-semibold">Your verification request is under review.</p>
                    <p className="mt-1 text-sm text-amber-800/80">
                      Our team will review your documents and notify you here once verified.
                    </p>
                  </div>
                ) : agent.verificationStatus !== "VERIFIED" ? (
                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={handleSubmitVerification}
                      disabled={submitting}
                      className="inline-flex items-center gap-2 rounded-full bg-emerald-800 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting && <Spinner className="h-4 w-4" />}
                      {submitting ? "Applying..." : "Apply for Verification"}
                    </button>
                  </div>
                ) : null}
              </Section>
            </div>
          )}

          {tab === "subscription" && (
            <Section title="Subscription">
              <p className="text-sm italic text-emerald-900/50">Coming soon.</p>
            </Section>
          )}
        </div>
      </div>

      {submitSuccess && (
        <SuccessOverlay
          title="Submitted for Verification"
          message="Your documents have been submitted successfully. Our team will verify your information. Once verified, your company will be listed on UmrahChal."
          onClose={() => setSubmitSuccess(false)}
        />
      )}
    </div>
  );
}

function PreviewItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-emerald-900/50">{label}</dt>
      <dd className={`mt-0.5 text-sm ${value ? "text-emerald-950" : "text-emerald-900/40 italic"}`}>
        {value || "Not set"}
      </dd>
    </div>
  );
}

function Section({
  title,
  headerAction,
  children,
}: {
  title: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-emerald-900/10 sm:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-emerald-950">{title}</h2>
        {headerAction}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

const STATUS_LABELS: Record<string, string> = {
  INCOMPLETE: "Incomplete",
  PENDING: "Pending",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
};

const STAT_ACCENTS = {
  emerald: "bg-emerald-50 text-emerald-700",
  sky: "bg-sky-50 text-sky-700",
  amber: "bg-amber-50 text-amber-700",
  violet: "bg-violet-50 text-violet-700",
} as const;

function StatCard({
  label,
  value,
  accent,
  children,
}: {
  label: string;
  value: string;
  accent: keyof typeof STAT_ACCENTS;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-emerald-900/10">
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${STAT_ACCENTS[accent]}`}>
        {label}
      </span>
      <p className="mt-4 text-2xl font-bold text-emerald-950">{value}</p>
      {children}
    </div>
  );
}

function StatusBanner({ agent }: { agent: PrivateAgent }) {
  if (agent.verificationStatus === "VERIFIED") {
    return (
      <div className="rounded-xl bg-emerald-50 px-5 py-4 text-emerald-900 ring-1 ring-emerald-600/20">
        <p className="font-semibold">Verified &mdash; Your company is listed on UmrahChal.</p>
        {!agent.isListed && (
          <p className="mt-1 text-sm text-emerald-800/80">
            Your listing is currently unpublished by the UmrahChal team. Contact support for
            details.
          </p>
        )}
      </div>
    );
  }
  if (agent.verificationStatus === "PENDING") {
    return (
      <div className="rounded-xl bg-amber-50 px-5 py-4 text-amber-900 ring-1 ring-amber-600/20">
        <p className="font-semibold">Your verification request is under review.</p>
        <p className="mt-1 text-sm text-amber-800/80">
          Our team will review your documents and notify you once verified.
        </p>
      </div>
    );
  }
  if (agent.verificationStatus === "REJECTED") {
    return (
      <div className="rounded-xl bg-red-50 px-5 py-4 text-red-900 ring-1 ring-red-600/20">
        <p className="font-semibold">Your verification request was rejected.</p>
        {agent.rejectionReason && <p className="mt-1 text-sm text-red-800/80">Reason: {agent.rejectionReason}</p>}
        <p className="mt-1 text-sm text-red-800/80">
          Update your information and documents under "All Info", then submit again for review.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-xl bg-zinc-50 px-5 py-4 text-zinc-800 ring-1 ring-zinc-500/20">
      <p className="font-semibold">Complete your company verification to get listed on UmrahChal.</p>
    </div>
  );
}

function DocumentUploader({
  label,
  required,
  uploaded,
  uploading,
  onUpload,
}: {
  label: string;
  required?: boolean;
  uploaded: { url: string; publicId: string } | null;
  uploading: boolean;
  onUpload: (file: File) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-emerald-950">
        {label}{" "}
        {required ? (
          <span className="text-red-500">*</span>
        ) : (
          <span className="font-normal text-emerald-900/40">(Optional)</span>
        )}
      </p>
      <p className="mt-1 text-xs text-emerald-900/60">
        {uploaded ? "Uploaded — you can replace it below." : "Not uploaded yet."}
      </p>
      <div className="mt-2">
        <UploadButton uploading={uploading} onUpload={onUpload} label={uploaded ? "Replace file" : "Upload file"} />
      </div>
    </div>
  );
}

function UploadButton({
  label,
  uploading,
  disabled,
  accept,
  onUpload,
}: {
  label: string;
  uploading: boolean;
  disabled?: boolean;
  accept?: string;
  onUpload: (file: File) => void;
}) {
  return (
    <label
      className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-emerald-900/15 px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-50 ${
        disabled || uploading ? "cursor-not-allowed opacity-50" : ""
      }`}
    >
      {uploading && <Spinner className="h-4 w-4" />}
      {uploading ? "Uploading..." : label}
      <input
        type="file"
        accept={accept ?? ".pdf,.jpg,.jpeg,.png,.webp"}
        className="hidden"
        disabled={disabled || uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = "";
        }}
      />
    </label>
  );
}
