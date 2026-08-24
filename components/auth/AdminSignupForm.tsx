"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Field, inputClass } from "@/components/form";
import Spinner from "@/components/Spinner";
import PasswordInput from "@/components/PasswordInput";
import OtpVerifyStep from "@/components/auth/OtpVerifyStep";

export default function AdminSignupForm() {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "otp">("details");
  const [form, setForm] = useState({
    name: "",
    mobileNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendOtp() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, purpose: "SIGNUP", portal: "admin" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStep("otp");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleDetailsSubmit(event: FormEvent) {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    sendOtp();
  }

  async function handleVerify(otp: string) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: form.mobileNumber, purpose: "SIGNUP", otp, portal: "admin" }),
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
        UmrahJao.
      </p>

      <div className="mt-6">
        {step === "details" ? (
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
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
                inputMode="numeric"
                placeholder="10-digit mobile number"
                maxLength={10}
                value={form.mobileNumber}
                onChange={(e) =>
                  setForm({ ...form, mobileNumber: e.target.value.replace(/\D/g, "").slice(0, 10) })
                }
                className={inputClass}
              />
              <span className="mt-1 block text-xs text-emerald-900/60">
                You&apos;ll receive an OTP on this number to verify your account.
              </span>
            </Field>
            <Field label="Email">
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
              />
              <span className="mt-1 block text-xs text-emerald-900/60">
                So you can also log in with email + password, in addition to mobile OTP.
              </span>
            </Field>
            <Field label="Password">
              <PasswordInput
                minLength={8}
                value={form.password}
                onChange={(value) => setForm({ ...form, password: value })}
              />
            </Field>
            <Field label="Confirm Password">
              <PasswordInput
                minLength={8}
                value={form.confirmPassword}
                onChange={(value) => setForm({ ...form, confirmPassword: value })}
              />
            </Field>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading || form.mobileNumber.length !== 10}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
              style={{ background: "#1D6FD8" }}
            >
              {loading && <Spinner className="h-4 w-4" />}
              {loading ? "Sending OTP..." : "Sign Up"}
            </button>
          </form>
        ) : (
          <OtpVerifyStep
            mobileNumber={form.mobileNumber}
            loading={loading}
            error={error}
            onVerify={handleVerify}
            onResend={sendOtp}
            onChangeNumber={() => {
              setStep("details");
              setError(null);
            }}
          />
        )}
      </div>

      <p className="mt-6 text-center text-sm text-emerald-900/70">
        Already registered?{" "}
        <Link href="/admin/login" className="font-medium text-emerald-800 hover:text-emerald-600">
          Agent login
        </Link>
      </p>
    </div>
  );
}
