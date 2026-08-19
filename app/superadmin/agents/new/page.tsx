"use client";

import { useMemo, useState } from "react";
import Spinner from "@/components/Spinner";
import PageHeader from "@/components/superadmin/PageHeader";
import { VerifiedTick } from "@/components/VerifiedBadge";
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
  verificationBadge: "BLUE" as "BLUE" | "GOLD",
};

const fieldClass =
  "w-full box-border rounded-2xl border-none bg-white px-4 py-3.5 text-[13.5px] font-semibold text-[#24201A] outline-none neu-pressed";

export default function NewAgentPage() {
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const cities = useMemo(() => getCitiesForState(form.state), [form.state]);
  const initial = (form.companyName.trim()[0] || "A").toUpperCase();

  function handleImageChange(file: File | null) {
    setImageFile(file);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  function handleReset() {
    setForm(emptyForm);
    handleImageChange(null);
    setMessage(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.companyName.trim() || !form.mobileNumber.trim() || !form.whatsappNumber.trim() || !form.businessType) {
      setMessage({ type: "error", text: "Business name, business type, call number and WhatsApp number are required." });
      return;
    }
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
      body.set("verificationBadge", form.verificationBadge);
      if (imageFile) body.set("profileImage", imageFile);

      const res = await fetch("/api/superadmin/agents", { method: "POST", body });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to add agent" });
        return;
      }

      setMessage({ type: "success", text: `${data.agent.companyName} added and published as VERIFIED on the public directory.` });
      setForm(emptyForm);
      handleImageChange(null);
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        crumb="AGENTS"
        title="Add Agent"
        subtitle="Add an agency directly — it publishes live as verified and listed, no signup flow"
      />

      <form onSubmit={handleSubmit} className="mt-[26px] max-w-[960px]">
        {message && (
          <div
            className={
              "mb-[18px] flex items-center gap-2.5 rounded-[18px] px-[18px] py-3.5 text-[13px] font-bold " +
              (message.type === "success" ? "bg-[#0E5B4A]/10 text-[#0A4438]" : "bg-[#C0392B]/10 text-[#A0301F]")
            }
          >
            <span>{message.type === "success" ? "✓" : "⚠"}</span>
            {message.text}
          </div>
        )}

        <div className="neu-raised rounded-3xl bg-white p-7">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <div className="text-base font-extrabold text-[#24201A]">Agent details</div>
              <div className="mt-1 text-xs text-[#8A7F6C]">
                Added by staff — publishes live as VERIFIED and listed, no signup flow.
              </div>
            </div>
            <div
              className="flex items-center gap-[7px] rounded-full px-3 py-[7px] text-[10px] font-extrabold tracking-[0.08em]"
              style={{ color: "#0A4438", background: "rgba(14,91,74,.14)" }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#0E5B4A]" />
              PUBLISHES AS VERIFIED
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-[7px] text-[11px] font-bold text-[#6E6455]">Verification badge</div>
            <div className="flex flex-wrap gap-[9px]">
              <button
                type="button"
                onClick={() => setForm({ ...form, verificationBadge: "BLUE" })}
                className={
                  "flex items-center gap-[7px] rounded-2xl px-[14px] py-2.5 text-xs font-bold transition " +
                  (form.verificationBadge === "BLUE" ? "text-[#F6E2B4]" : "neu-raised-sm text-[#4A4238]")
                }
                style={form.verificationBadge === "BLUE" ? { background: "#1D6FD8" } : undefined}
              >
                <VerifiedTick badge="BLUE" />
                Blue Verified
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, verificationBadge: "GOLD" })}
                className={
                  "flex items-center gap-[7px] rounded-2xl px-[14px] py-2.5 text-xs font-bold transition " +
                  (form.verificationBadge === "GOLD" ? "text-[#3A2E00]" : "neu-raised-sm text-[#4A4238]")
                }
                style={form.verificationBadge === "GOLD" ? { background: "#D4A017" } : undefined}
              >
                <VerifiedTick badge="GOLD" />
                Gold Verified
              </button>
            </div>
          </div>

          <div className="mt-[26px] grid grid-cols-1 gap-[30px] sm:grid-cols-[156px_1fr]">
            <div className="flex flex-col items-center gap-3">
              <div className="neu-inset h-[124px] w-[124px] rounded-full p-[7px]">
                <div className="relative h-full w-full overflow-hidden rounded-full bg-white">
                  {imagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element -- local blob: preview
                    <img src={imagePreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-3xl font-extrabold text-[#0E5B4A]">
                      {initial}
                    </div>
                  )}
                </div>
              </div>
              <label className="cursor-pointer text-xs font-bold text-[#0E5B4A]">
                Upload profile image
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
                />
              </label>
              <div className="text-center text-[10px] leading-[1.5] text-[#9A907C]">
                Square JPG or PNG, min 400×400.
                <br />
                Falls back to the initial &ldquo;{initial}&rdquo;.
              </div>
            </div>

            <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
              <div className="sm:col-span-2">
                <div className="mb-[7px] text-[11px] font-bold text-[#6E6455]">
                  Business Name <span className="text-[#C0392B]">*</span>
                </div>
                <input
                  required
                  className={fieldClass}
                  placeholder="e.g. Al-Safar Travels"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2">
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-[11px] font-bold text-[#6E6455]">Business Type</span>
                  <span className="text-[10.5px] text-[#9A907C]">This is also how pilgrims filter agents on the homepage.</span>
                </div>
                <div className="flex flex-wrap gap-[9px]">
                  {SERVICES.map((service) => {
                    const active = form.businessType === service.slug;
                    return (
                      <button
                        key={service.slug}
                        type="button"
                        onClick={() => setForm({ ...form, businessType: service.slug })}
                        className={
                          "flex items-center gap-[7px] rounded-2xl px-[14px] py-2.5 text-xs font-bold transition " +
                          (active ? "text-[#F6E2B4]" : "neu-raised-sm text-[#4A4238]")
                        }
                        style={active ? { background: "#06042a" } : undefined}
                      >
                        <span className="text-[13px]">{service.icon}</span>
                        {service.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="mb-[7px] text-[11px] font-bold text-[#6E6455]">
                  Call Number <span className="text-[#C0392B]">*</span>
                </div>
                <input
                  required
                  className={fieldClass}
                  placeholder="+91 98490 12345"
                  value={form.mobileNumber}
                  onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-[7px] flex items-baseline justify-between">
                  <span className="text-[11px] font-bold text-[#6E6455]">
                    WhatsApp Number <span className="text-[#C0392B]">*</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, whatsappNumber: form.mobileNumber })}
                    className="text-[10.5px] font-bold text-[#0E5B4A]"
                  >
                    Same as call number
                  </button>
                </div>
                <input
                  required
                  className={fieldClass}
                  placeholder="+91 98490 12345"
                  value={form.whatsappNumber}
                  onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                />
              </div>

              <div>
                <div className="mb-[7px] text-[11px] font-bold text-[#6E6455]">Country</div>
                <select
                  className={fieldClass}
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="mb-[7px] text-[11px] font-bold text-[#6E6455]">State</div>
                <select
                  className={fieldClass}
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value, city: "" })}
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
              </div>
              <div>
                <div className="mb-[7px] text-[11px] font-bold text-[#6E6455]">City</div>
                <select
                  className={fieldClass}
                  disabled={!form.state}
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                >
                  <option value="" disabled>
                    {form.state ? "Select city" : "Select a state first"}
                  </option>
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <div className="text-[11px] leading-[1.5] text-[#9A907C]">City list cascades from the selected state.</div>
              </div>
            </div>
          </div>

          <div className="my-[26px] h-px bg-gradient-to-r from-[#96897650] to-white/95" />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-full px-[26px] py-[15px] text-[13.5px] font-extrabold text-[#F6E2B4] disabled:opacity-75"
              style={{ background: "#06042a" }}
            >
              {saving && <Spinner className="h-3.5 w-3.5" />}
              {saving ? "Adding agent…" : "Add Agent"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className="neu-raised-sm rounded-full px-6 py-[13px] text-[13px] font-bold text-[#6E6455] disabled:opacity-50"
            >
              Reset
            </button>
            <div className="ml-auto text-[11.5px] text-[#9A907C]">
              Required: business name, business type, call number, WhatsApp number.
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
