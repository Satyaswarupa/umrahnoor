"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const MESSAGES = [
  {
    line1: "Connect with",
    highlight: "1 Crore+ Pilgrims",
    line2: "Grow Your Business in",
    highlight2: "3 Easy Steps",
  },
  {
    line1: "Reach Thousands of",
    highlight: "Umrah Travelers",
    line2: "Get Verified in Just",
    highlight2: "3 Simple Steps",
  },
  {
    line1: "Join India's Most",
    highlight: "Trusted Umrah Network",
    line2: "List Your Agency in",
    highlight2: "Minutes",
  },
  {
    line1: "Get Discovered by",
    highlight: "Pilgrims Nationwide",
    line2: "Complete a Quick",
    highlight2: "3-Step Verification",
  },
];

export default function AgentPromoWidget({
  visible,
  dismissed,
  onDismiss,
}: {
  visible: boolean;
  dismissed: boolean;
  onDismiss: () => void;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<(typeof MESSAGES)[number] | null>(null);

  useEffect(() => {
    const pickId = setTimeout(() => {
      setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
    }, 0);
    return () => clearTimeout(pickId);
  }, []);

  if (dismissed || !message) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-40 w-[280px] max-w-[calc(100vw-2rem)] transition-all duration-500 ease-out sm:bottom-6 sm:right-6 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      <div className="relative rounded-2xl bg-emerald-900 p-5 pt-6 text-white shadow-lg ring-1 ring-emerald-950/20">
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-emerald-200 hover:bg-white/10 hover:text-white"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
            <path
              d="M5 5L15 15M15 5L5 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <p className="pr-4 text-sm leading-snug text-emerald-100/90">
          {message.line1}{" "}
          <span className="font-bold text-white">{message.highlight}</span>
        </p>
        <p className="mt-1 text-sm leading-snug text-emerald-100/90">
          {message.line2}{" "}
          <span className="font-bold text-white">{message.highlight2}</span>
        </p>

        <button
          type="button"
          onClick={() => router.push("/admin/signup")}
          className="mt-4 w-full rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-emerald-900 shadow-sm transition-colors hover:bg-emerald-50"
        >
          List your Business for FREE
        </button>
      </div>
    </div>
  );
}
