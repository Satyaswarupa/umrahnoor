"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Field, inputClass, selectClass } from "@/components/form";
import { COUNTRIES, INDIA_STATES, getCitiesForState } from "@/lib/locations";

const initialForm = {
  companyName: "",
  ownerName: "",
  email: "",
  password: "",
  confirmPassword: "",
  mobileNumber: "",
  whatsappNumber: "",
  country: "India",
  state: "",
  city: "",
  address: "",
};

export default function AdminSignupForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const cities = useMemo(() => getCitiesForState(form.state), [form.state]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-emerald-900/10">
      <h1 className="text-2xl font-bold text-emerald-950">Register your travel agency</h1>
      <p className="mt-1 text-sm text-emerald-900/70">
        Create your agent account, then complete verification to get listed on UmrahNoor.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Agent / Company Name">
          <input
            required
            type="text"
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Owner / Contact Person Name">
          <input
            required
            type="text"
            value={form.ownerName}
            onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Email">
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Mobile Number">
          <input
            required
            type="tel"
            placeholder="+91XXXXXXXXXX"
            value={form.mobileNumber}
            onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="WhatsApp Number">
          <input
            required
            type="tel"
            placeholder="+91XXXXXXXXXX"
            value={form.whatsappNumber}
            onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Password">
          <input
            required
            type="password"
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Confirm Password">
          <input
            required
            type="password"
            minLength={8}
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Country">
          <select
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            className={selectClass}
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
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value, city: "" })}
            className={selectClass}
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
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            disabled={!form.state}
            className={selectClass}
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
        </Field>
        <div className="sm:col-span-2">
          <Field label="Full Business Address">
            <textarea
              required
              rows={3}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>

        {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-emerald-800 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 sm:col-span-2"
        >
          {loading ? "Creating account..." : "Create Agent Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-emerald-900/70">
        Already registered?{" "}
        <Link href="/admin/login" className="font-medium text-emerald-800 hover:text-emerald-600">
          Agent login
        </Link>
      </p>
    </div>
  );
}
