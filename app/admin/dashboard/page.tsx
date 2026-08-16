"use client";

import { useEffect, useMemo, useState } from "react";
import { Field, inputClass, selectClass } from "@/components/form";
import StatusBadge from "@/components/StatusBadge";
import SuccessOverlay from "@/components/SuccessOverlay";
import { COUNTRIES, INDIA_STATES, getCitiesForState } from "@/lib/locations";
import type { PrivateAgent } from "@/lib/types";

const emptyProfile = {
  companyName: "",
  ownerName: "",
  mobileNumber: "",
  whatsappNumber: "",
  country: "India",
  state: "",
  city: "",
  address: "",
  gstNumber: "",
  verifiedCertificate: "",
  description: "",
};

function profileFromAgent(agent: PrivateAgent) {
  return {
    companyName: agent.companyName ?? "",
    ownerName: agent.ownerName ?? "",
    mobileNumber: agent.mobileNumber ?? "",
    whatsappNumber: agent.whatsappNumber ?? "",
    country: agent.country || "India",
    state: agent.state ?? "",
    city: agent.city ?? "",
    address: agent.address ?? "",
    gstNumber: agent.gstNumber ?? "",
    verifiedCertificate: agent.verifiedCertificate ?? "",
    description: agent.description ?? "",
  };
}

export default function AgentDashboardPage() {
  const [agent, setAgent] = useState<PrivateAgent | null>(null);
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [uploading, setUploading] = useState<string | null>(null);

  const cities = useMemo(() => getCitiesForState(profile.state), [profile.state]);

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

  function handleStartEdit() {
    if (agent) setProfile(profileFromAgent(agent));
    setMessage(null);
    setEditingProfile(true);
  }

  function handleCancelEdit() {
    if (agent) setProfile(profileFromAgent(agent));
    setEditingProfile(false);
  }

  async function handleSaveProfile(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/agent/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to save profile" });
        return;
      }
      setAgent(data.agent);
      setProfile(profileFromAgent(data.agent));
      setEditingProfile(false);
      setMessage({ type: "success", text: "Profile saved successfully." });
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(type: "gst" | "certificate" | "additional", file: File) {
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
      setMessage({ type: "success", text: "Document uploaded successfully." });
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
        text: "Your documents have been submitted successfully. Our team will review your information and you will be notified here once your company is verified and listed on UmrahNoor.",
      });
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-10 text-emerald-900/60 sm:px-6">Loading dashboard...</div>;
  }

  if (!agent) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <p className="text-red-600">Could not load your agent profile. Please try logging in again.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-emerald-950">{agent.companyName || "Your Agency"}</h1>
        <StatusBadge status={agent.verificationStatus} />
      </div>

      <StatusBanner agent={agent} />

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

      <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-emerald-900/10">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-emerald-950">Company Profile</h2>
          {!editingProfile && (
            <button
              onClick={handleStartEdit}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-900/15 px-3 py-1.5 text-sm font-medium text-emerald-900 hover:bg-emerald-50"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793 3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit
            </button>
          )}
        </div>

        {editingProfile ? (
          <form onSubmit={handleSaveProfile} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Company Name">
              <input
                required
                className={inputClass}
                value={profile.companyName}
                onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
              />
            </Field>
            <Field label="Owner / Contact Person">
              <input
                required
                className={inputClass}
                value={profile.ownerName}
                onChange={(e) => setProfile({ ...profile, ownerName: e.target.value })}
              />
            </Field>
            <Field label="Mobile Number">
              <input
                required
                className={inputClass}
                value={profile.mobileNumber}
                onChange={(e) => setProfile({ ...profile, mobileNumber: e.target.value })}
              />
            </Field>
            <Field label="WhatsApp Number">
              <input
                required
                className={inputClass}
                value={profile.whatsappNumber}
                onChange={(e) => setProfile({ ...profile, whatsappNumber: e.target.value })}
              />
            </Field>
            <Field label="Country">
              <select
                className={selectClass}
                value={profile.country}
                onChange={(e) => setProfile({ ...profile, country: e.target.value })}
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
                required
                className={selectClass}
                value={profile.state}
                onChange={(e) => setProfile({ ...profile, state: e.target.value, city: "" })}
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
                required
                className={selectClass}
                disabled={!profile.state}
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              >
                <option value="" disabled>
                  {profile.state ? "Select city" : "Select a state first"}
                </option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="GST Number">
              <input
                className={inputClass}
                placeholder="15-character GST number"
                value={profile.gstNumber}
                onChange={(e) => setProfile({ ...profile, gstNumber: e.target.value })}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Full Business Address">
                <textarea
                  required
                  rows={2}
                  className={inputClass}
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Verified Certificate (name / number)">
              <input
                className={inputClass}
                placeholder="e.g. IATA Certificate No. 12345"
                value={profile.verifiedCertificate}
                onChange={(e) => setProfile({ ...profile, verifiedCertificate: e.target.value })}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Short Description">
                <textarea
                  rows={3}
                  className={inputClass}
                  placeholder="Tell customers about your agency and Umrah services."
                  value={profile.description}
                  onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                />
              </Field>
            </div>

            <div className="flex gap-3 sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="rounded-lg border border-emerald-900/15 px-4 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-50 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <ProfileView agent={agent} />
        )}
      </section>

      <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-emerald-900/10">
        <h2 className="text-lg font-semibold text-emerald-950">Verification Documents</h2>
        <p className="mt-1 text-sm text-emerald-900/60">
          Accepted formats: PDF, JPG, PNG, WEBP. Maximum size 5MB. Documents are private and are
          only visible to you and the UmrahNoor verification team.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <DocumentUploader
            label="GST Document"
            required
            uploaded={agent.gstDocument}
            uploading={uploading === "gst"}
            onUpload={(file) => handleUpload("gst", file)}
          />
          <DocumentUploader
            label="Verified Certificate"
            required
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
      </section>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmitVerification}
          disabled={submitting || agent.verificationStatus === "VERIFIED"}
          className="rounded-full bg-emerald-800 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? "Submitting..."
            : agent.verificationStatus === "VERIFIED"
              ? "Already Verified"
              : "Submit for Verification"}
        </button>
      </div>

      {submitSuccess && (
        <SuccessOverlay
          title="Submitted for Verification"
          message="Your documents have been submitted successfully. Our team will verify your information. Once verified, your company will be listed on UmrahNoor."
          onClose={() => setSubmitSuccess(false)}
        />
      )}
    </div>
  );
}

function ProfileView({ agent }: { agent: PrivateAgent }) {
  const location = [agent.city, agent.state, agent.country].filter(Boolean).join(", ");

  return (
    <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
      <InfoItem label="Company Name" value={agent.companyName} />
      <InfoItem label="Owner / Contact Person" value={agent.ownerName} />
      <InfoItem label="Mobile Number" value={agent.mobileNumber} />
      <InfoItem label="WhatsApp Number" value={agent.whatsappNumber} />
      <InfoItem label="Location" value={location} />
      <InfoItem label="GST Number" value={agent.gstNumber} />
      <InfoItem label="Full Business Address" value={agent.address} full />
      <InfoItem label="Verified Certificate" value={agent.verifiedCertificate} />
      <InfoItem label="Short Description" value={agent.description} full />
    </dl>
  );
}

function InfoItem({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <dt className="text-xs font-medium uppercase tracking-wide text-emerald-900/50">{label}</dt>
      <dd className={`mt-0.5 ${value ? "text-emerald-950" : "text-emerald-900/40 italic"}`}>
        {value || "Not set"}
      </dd>
    </div>
  );
}

function StatusBanner({ agent }: { agent: PrivateAgent }) {
  if (agent.verificationStatus === "VERIFIED") {
    return (
      <div className="mt-4 rounded-xl bg-emerald-50 px-5 py-4 text-emerald-900 ring-1 ring-emerald-600/20">
        <p className="font-semibold">Verified &mdash; Your company is listed on UmrahNoor.</p>
        {!agent.isListed && (
          <p className="mt-1 text-sm text-emerald-800/80">
            Your listing is currently unpublished by the UmrahNoor team. Contact support for
            details.
          </p>
        )}
      </div>
    );
  }
  if (agent.verificationStatus === "PENDING") {
    return (
      <div className="mt-4 rounded-xl bg-amber-50 px-5 py-4 text-amber-900 ring-1 ring-amber-600/20">
        <p className="font-semibold">Your verification request is under review.</p>
        <p className="mt-1 text-sm text-amber-800/80">
          Our team will review your documents and notify you once verified.
        </p>
      </div>
    );
  }
  if (agent.verificationStatus === "REJECTED") {
    return (
      <div className="mt-4 rounded-xl bg-red-50 px-5 py-4 text-red-900 ring-1 ring-red-600/20">
        <p className="font-semibold">Your verification request was rejected.</p>
        {agent.rejectionReason && <p className="mt-1 text-sm text-red-800/80">Reason: {agent.rejectionReason}</p>}
        <p className="mt-1 text-sm text-red-800/80">
          Update your information and documents below, then submit again for review.
        </p>
      </div>
    );
  }
  return (
    <div className="mt-4 rounded-xl bg-zinc-50 px-5 py-4 text-zinc-800 ring-1 ring-zinc-500/20">
      <p className="font-semibold">Complete your company verification to get listed on UmrahNoor.</p>
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
        {label} {required && <span className="text-red-500">*</span>}
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
  onUpload,
}: {
  label: string;
  uploading: boolean;
  disabled?: boolean;
  onUpload: (file: File) => void;
}) {
  return (
    <label
      className={`inline-flex cursor-pointer items-center rounded-lg border border-emerald-900/15 px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-50 ${
        disabled || uploading ? "cursor-not-allowed opacity-50" : ""
      }`}
    >
      {uploading ? "Uploading..." : label}
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
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
