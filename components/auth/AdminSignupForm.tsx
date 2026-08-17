"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Field, inputClass } from "@/components/form";
import Spinner from "@/components/Spinner";

const initialForm = {
  name: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function AdminSignupForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/agent-signup", {
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
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-emerald-900/10">
      <h1 className="text-2xl font-bold text-emerald-950">Register as an Umrah agent</h1>
      <p className="mt-1 text-sm text-emerald-900/70">
        Create your account, then complete your business registration to get listed on
        UmrahChal.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field label="Full Name">
          <input
            required
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Mobile Number">
          <input
            required
            type="tel"
            placeholder="+91XXXXXXXXXX"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
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

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-800 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading && <Spinner className="h-4 w-4" />}
          {loading ? "Creating account..." : "Sign Up"}
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
