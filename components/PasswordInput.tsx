"use client";

import { useState } from "react";
import { inputClass } from "@/components/form";

export default function PasswordInput({
  value,
  onChange,
  minLength,
  required = true,
}: {
  value: string;
  onChange: (value: string) => void;
  minLength?: number;
  required?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        required={required}
        type={visible ? "text" : "password"}
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass + " pr-11"}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-900/40 transition hover:text-emerald-900/80"
      >
        {visible ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.9 4.24A9.4 9.4 0 0 1 12 4c6.5 0 10 8 10 8a17.9 17.9 0 0 1-2.17 3.19m-3.06 2.53A9.6 9.6 0 0 1 12 20c-6.5 0-10-8-10-8a17.9 17.9 0 0 1 4.16-5.6" />
            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
            <path d="M2 2l20 20" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
