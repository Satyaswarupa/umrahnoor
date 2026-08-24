"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Field, inputClass } from "@/components/form";
import Spinner from "@/components/Spinner";
import PasswordInput from "@/components/PasswordInput";

// Just the email/password form fields + submit logic — reused both by the
// standalone email-login pages (EmailLoginForm) and inline as a tab inside
// LoginForm/AdminLoginForm, which supply their own heading/layout around it.
export default function EmailLoginFields({ portal }: { portal: "user" | "admin" }) {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, portal }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      if (data.role === "SUPERADMIN") {
        router.push("/superadmin/dashboard");
      } else if (portal === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <PasswordInput
          value={form.password}
          onChange={(value) => setForm({ ...form, password: value })}
        />
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
        style={{ background: "#1D6FD8" }}
      >
        {loading && <Spinner className="h-4 w-4" />}
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
