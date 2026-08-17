"use client";

import { useMemo, useState } from "react";
import { Field, inputClass, selectClass } from "@/components/form";
import Spinner from "@/components/Spinner";
import { COUNTRIES, INDIA_STATES, getCitiesForState } from "@/lib/locations";
import { SERVICES } from "@/lib/services";

const emptyForm = {
  companyName: "",
  businessType: "",
  mobileNumber: "",
  whatsappNumber: "",
  country: "India",
  state: "",
  city: "",
};

export default function NewAgentPage() {
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const cities = useMemo(() => getCitiesForState(form.state), [form.state]);

  function handleImageChange(file: File | null) {
    setImageFile(file);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const body = new FormData();
      body.set("companyName", form.companyName);
      body.set("businessType", form.businessType);
      body.set("mobileNumber", form.mobileNumber);
      body.set("whatsappNumber", form.whatsappNumber);
      body.set("country", form.country);
      body.set("state", form.state);
      body.set("city", form.city);
      if (imageFile) body.set("profileImage", imageFile);

      const res = await fetch("/api/superadmin/agents", { method: "POST", body });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to add agent" });
        return;
      }

      setMessage({ type: "success", text: `${data.agent.companyName} was added and is now live on the site.` });
      setForm(emptyForm);
      handleImageChange(null);
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-emerald-950">Add Agent</h1>
      <p className="mt-1 text-sm text-emerald-900/70">
        Add an agent directly — they&apos;re published as verified and listed on the site
        immediately, no review queue.
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

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-emerald-900/10">
        <Field label="Business Name *">
          <input
            required
            className={inputClass}
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
          />
        </Field>

        <Field label="Business Type *">
          <select
            required
            className={selectClass}
            value={form.businessType}
            onChange={(e) => setForm({ ...form, businessType: e.target.value })}
          >
            <option value="" disabled>
              Select Business Type
            </option>
            {SERVICES.map((service) => (
              <option key={service.slug} value={service.slug}>
                {service.icon} {service.label}
              </option>
            ))}
          </select>
        </Field>
        <p className="-mt-3 text-xs text-emerald-900/50">
          This is also how pilgrims filter agents on the homepage.
        </p>

        <div>
          <span className="text-sm font-medium text-emerald-950">Profile Image</span>
          <div className="mt-1 flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-emerald-50 ring-1 ring-emerald-900/10">
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element -- local blob: preview, not an optimizable remote/static asset
                <img src={imagePreview} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-lg font-semibold text-emerald-900/30">
                  {form.companyName.charAt(0).toUpperCase() || "?"}
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
              className="text-sm text-emerald-900/70"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <Field label="Call Number *">
              <input
                required
                className={inputClass}
                placeholder="e.g. 9876543210"
                value={form.mobileNumber}
                onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
              />
            </Field>
          </div>
          <div>
            <Field label="WhatsApp Number *">
              <input
                required
                className={inputClass}
                placeholder="e.g. 9876543210"
                value={form.whatsappNumber}
                onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
              />
            </Field>
            <button
              type="button"
              onClick={() => setForm({ ...form, whatsappNumber: form.mobileNumber })}
              className="mt-1 text-xs font-medium text-emerald-700 hover:text-emerald-800"
            >
              Same as call number
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Country *">
            <select
              required
              className={selectClass}
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="State *">
            <select
              required
              className={selectClass}
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value, city: "" })}
            >
              <option value="" disabled>
                Select State
              </option>
              {INDIA_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="City *">
            <select
              required
              disabled={!form.state}
              className={selectClass}
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            >
              <option value="" disabled>
                {form.state ? "Select City" : "Select a state first"}
              </option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving && <Spinner className="h-4 w-4" />}
          {saving ? "Adding..." : "Add Agent"}
        </button>
      </form>
    </div>
  );
}
