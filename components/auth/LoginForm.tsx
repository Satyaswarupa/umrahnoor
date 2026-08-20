"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Field, inputClass } from "@/components/form";
import Spinner from "@/components/Spinner";

export default function LoginForm() {
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
        body: JSON.stringify({ ...form, portal: "user" }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-emerald-900/10">
      <h1 className="text-2xl font-bold text-emerald-950">Welcome back</h1>
      <p className="mt-1 text-sm text-emerald-900/70">
        Log in to search verified Umrah travel agents.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={inputClass}
          />
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
          style={{ background: "#CCAE2C" }}
        >
          {loading && <Spinner className="h-4 w-4" />}
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-emerald-900/70">
        New to UmrahJao?{" "}
        <Link href="/signup" className="font-medium text-emerald-800 hover:text-emerald-600">
          Create an account
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-emerald-900/70">
        Are you a travel agent?{" "}
        <Link href="/admin/login" className="font-medium text-emerald-800 hover:text-emerald-600">
          Agent / Admin login
        </Link>
      </p>
    </div>
  );
}
