"use client";

import { useEffect, useState } from "react";

export default function SuccessOverlay({
  title,
  message,
  onClose,
}: {
  title: string;
  message: string;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/60 p-4 transition-opacity duration-300 ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl transition-all duration-300 ${
          mounted ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        <svg viewBox="0 0 100 100" className="mx-auto h-20 w-20 text-emerald-600">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            pathLength={1}
            style={{
              strokeDasharray: 1,
              strokeDashoffset: mounted ? 0 : 1,
              transition: "stroke-dashoffset 0.6s ease",
            }}
          />
          <path
            d="M30 52 L45 67 L72 34"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            style={{
              strokeDasharray: 1,
              strokeDashoffset: mounted ? 0 : 1,
              transition: "stroke-dashoffset 0.4s ease 0.5s",
            }}
          />
        </svg>

        <h2 className="mt-5 text-xl font-bold text-emerald-950">{title}</h2>
        <p className="mt-2 text-sm text-emerald-900/70">{message}</p>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
