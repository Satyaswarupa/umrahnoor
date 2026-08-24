"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Field, inputClass } from "@/components/form";
import Spinner from "@/components/Spinner";
import OtpVerifyStep from "@/components/auth/OtpVerifyStep";
import EmailLoginFields from "@/components/auth/EmailLoginFields";

export default function LoginForm() {
  const router = useRouter();
  const [tab, setTab] = useState<"otp" | "email">("otp");
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [mobileNumber, setMobileNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function switchTab(next: "otp" | "email") {
    setTab(next);
    setStep("mobile");
    setError(null);
  }

  async function sendOtp() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber, purpose: "LOGIN", portal: "user" }),
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

  function handleMobileSubmit(event: FormEvent) {
    event.preventDefault();
    sendOtp();
  }

  async function handleVerify(otp: string) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber, purpose: "LOGIN", otp, portal: "user" }),
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

      <div className="mt-6 grid grid-cols-3 gap-1 rounded-lg bg-emerald-50 p-1">
        <button
          type="button"
          onClick={() => switchTab("otp")}
          className={
            "rounded-md px-1.5 py-2 text-center text-xs font-semibold transition sm:text-sm " +
            (tab === "otp" ? "bg-white text-emerald-950 shadow-sm" : "text-emerald-900/55 hover:text-emerald-900")
          }
        >
          Mobile OTP
        </button>
        <button
          type="button"
          onClick={() => switchTab("email")}
          className={
            "rounded-md px-1.5 py-2 text-center text-xs font-semibold transition sm:text-sm " +
            (tab === "email" ? "bg-white text-emerald-950 shadow-sm" : "text-emerald-900/55 hover:text-emerald-900")
          }
        >
          Email
        </button>
        <Link
          href="/admin/login"
          className="rounded-md px-1.5 py-2 text-center text-xs font-semibold text-emerald-900/55 transition hover:text-emerald-900 sm:text-sm"
        >
          Agent Login
        </Link>
      </div>

      <div className="mt-6">
        {tab === "email" ? (
          <EmailLoginFields portal="user" />
        ) : step === "mobile" ? (
          <form onSubmit={handleMobileSubmit} className="space-y-4">
            <Field label="Mobile Number">
              <input
                required
                type="tel"
                inputMode="numeric"
                placeholder="10-digit mobile number"
                maxLength={10}
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className={inputClass}
              />
              <span className="mt-1 block text-xs text-emerald-900/60">
                You&apos;ll receive an OTP on this number to log in.
              </span>
            </Field>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading || mobileNumber.length !== 10}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
              style={{ background: "#1D6FD8" }}
            >
              {loading && <Spinner className="h-4 w-4" />}
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <OtpVerifyStep
            mobileNumber={mobileNumber}
            loading={loading}
            error={error}
            onVerify={handleVerify}
            onResend={sendOtp}
            onChangeNumber={() => {
              setStep("mobile");
              setError(null);
            }}
          />
        )}
      </div>

      <p className="mt-6 text-center text-sm text-emerald-900/70">
        New to UmrahJao?{" "}
        <Link href="/signup" className="font-semibold text-emerald-800 hover:text-emerald-600">
          Create an account
        </Link>
      </p>
    </div>
  );
}
