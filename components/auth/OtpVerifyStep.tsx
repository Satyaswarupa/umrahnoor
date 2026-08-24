"use client";

import { useEffect, useState } from "react";
import { Field, inputClass } from "@/components/form";
import Spinner from "@/components/Spinner";
import { OTP_RESEND_COOLDOWN_SECONDS } from "@/lib/otp";

export default function OtpVerifyStep({
  mobileNumber,
  loading,
  error,
  onVerify,
  onResend,
  onChangeNumber,
}: {
  mobileNumber: string;
  loading: boolean;
  error: string | null;
  onVerify: (otp: string) => void;
  onResend: () => void;
  onChangeNumber: () => void;
}) {
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(OTP_RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  function handleResend() {
    setCooldown(OTP_RESEND_COOLDOWN_SECONDS);
    onResend();
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onVerify(otp);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-emerald-900/70">
        Enter the 6-digit code sent to{" "}
        <span className="font-semibold text-emerald-950">{mobileNumber}</span>.
      </p>

      <Field label="OTP">
        <input
          required
          autoFocus
          type="tel"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className={inputClass}
        />
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || otp.length !== 6}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
        style={{ background: "#1D6FD8" }}
      >
        {loading && <Spinner className="h-4 w-4" />}
        {loading ? "Verifying..." : "Verify OTP"}
      </button>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onChangeNumber}
          className="font-medium text-emerald-800 hover:text-emerald-600"
        >
          Change number
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || loading}
          className="font-medium text-emerald-800 hover:text-emerald-600 disabled:cursor-not-allowed disabled:text-emerald-900/40"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
        </button>
      </div>
    </form>
  );
}
