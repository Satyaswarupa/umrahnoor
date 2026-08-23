"use client";

import { useState } from "react";
import Image from "next/image";
import type { PublicAgentSummary } from "@/lib/types";
import { toTelLink, toWhatsappLink } from "@/lib/contact-links";
import { getServiceLabel } from "@/lib/services";

// Used whenever an agent has no profile image of their own — a generic,
// on-theme banner beats an empty gray box in the card's photo slot.
const FALLBACK_BANNER = "https://i.ibb.co/NnVKMYVN/Gemini-Generated-Image-2vrqva2vrqva2vrq.png";

export default function AgentCard({ agent }: { agent: PublicAgentSummary }) {
  const gold = agent.verificationBadge === "GOLD";
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/agents/${agent.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: agent.companyName, url });
      } catch {
        // Cancelled — nothing to do.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable — silently ignore, nothing worth surfacing.
    }
  }

  return (
    <div
      className={
        "overflow-hidden rounded-[26px] bg-white " +
        (gold ? "border-2 border-[#D4A017]/70 shadow-[0_4px_20px_rgba(212,160,23,0.18)]" : "neu-raised-sm")
      }
    >
      <div className="relative h-[150px] w-full bg-[#F4F2EC]">
        <Image
          src={agent.profileImage?.url ?? FALLBACK_BANNER}
          alt={`${agent.companyName} — verified Umrah agent`}
          fill
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 truncate text-[15px] font-extrabold tracking-tight text-[#151A40]">
            {agent.companyName}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span
              className="rounded-full px-2.5 py-[3px] text-[9.5px] font-bold text-white"
              style={{ background: gold ? "#D4A017" : "#16A34A" }}
            >
              {gold ? "Gold" : "Standard"}
            </span>
            <span className="rounded-full bg-[#16A34A] px-2.5 py-[3px] text-[9.5px] font-bold text-white">
              Available
            </span>
          </div>
        </div>
        {agent.businessType && (
          <div className="mt-0.5 text-[12px] font-bold text-[#0E5B4A]">
            {getServiceLabel(agent.businessType)}
          </div>
        )}

        <div className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[#7A705E]">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9A907C" strokeWidth={2.2} className="shrink-0">
            <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21z" />
            <circle cx="12" cy="9.5" r="2.4" />
          </svg>
          {[agent.city, agent.state].filter(Boolean).join(", ") || "Location not available"}
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-[12px] font-bold text-[#1D6FD8]">
            <svg viewBox="0 0 24 24" fill={gold ? "#D4A017" : "#1D6FD8"} className="h-3.5 w-3.5 shrink-0">
              <path d="M12 1.8l2.4 1.9 3-.3 1 2.9 2.6 1.6-1 2.9 1 2.9-2.6 1.6-1 2.9-3-.3L12 22.2 9.6 20.3l-3 .3-1-2.9L3 16.1l1-2.9-1-2.9 2.6-1.6 1-2.9 3 .3z" />
              <path d="M8.5 12.2l2.4 2.4 4.6-4.8" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
            </svg>
            {gold ? "Gold Verified" : "Verified"}
          </span>
          {agent.experienceYears ? (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-[#8A6A0A]" style={{ background: "rgba(212,160,23,0.12)" }}>
              🏆 {agent.experienceYears}+ yrs Trust
            </span>
          ) : null}
        </div>

        <a
          href={toTelLink(agent.mobileNumber)}
          className="mt-1.5 flex w-fit items-center gap-1.5 text-[12px] font-bold text-[#0E5B4A] hover:underline"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0E5B4A" strokeWidth={2.2} strokeLinejoin="round">
            <path d="M6.5 3.5l3 1 1.2 3.6-2 1.6c.7 2.2 2.4 3.9 4.6 4.6l1.6-2 3.6 1.2 1 3c-.4 1.4-1.8 2.3-3.3 2C10.4 18 6 13.6 4.5 6.8c-.3-1.5.6-2.9 2-3.3z" />
          </svg>
          View Mobile Number
        </a>

        <div className="mt-2.5 flex items-center justify-between">
          <div>
            {agent.startingPrice ? (
              <>
                <div className="text-[17px] font-extrabold text-[#0E5B4A]">
                  ₹{agent.startingPrice.toLocaleString("en-IN")}
                </div>
                <div className="text-[10px] font-semibold text-[#9A907C]">per person</div>
              </>
            ) : (
              <div className="text-[12px] font-bold text-[#6E6455]">Contact for pricing</div>
            )}
          </div>
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share this agent"
            className="neu-raised-sm grid h-7 w-7 shrink-0 place-items-center rounded-full"
          >
            {copied ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0E5B4A" strokeWidth={2.4} strokeLinecap="round">
                <path d="M5 12l4.5 4.5L19 7" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6E6455" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="2.5" />
                <circle cx="6" cy="12" r="2.5" />
                <circle cx="18" cy="19" r="2.5" />
                <path d="M8.2 10.8l7.6-4.1M8.2 13.2l7.6 4.1" />
              </svg>
            )}
          </button>
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <a
            href={toTelLink(agent.mobileNumber)}
            className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-[#0E5B4A] px-3 py-1.5"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0E5B4A" strokeWidth={2.2} strokeLinejoin="round">
              <path d="M6.5 3.5l3 1 1.2 3.6-2 1.6c.7 2.2 2.4 3.9 4.6 4.6l1.6-2 3.6 1.2 1 3c-.4 1.4-1.8 2.3-3.3 2C10.4 18 6 13.6 4.5 6.8c-.3-1.5.6-2.9 2-3.3z" />
            </svg>
            <span className="text-[12px] font-bold text-[#0E5B4A]">Call</span>
          </a>
          <a
            href={toWhatsappLink(agent.whatsappNumber, agent.companyName)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl px-3 py-1.5"
            style={{ background: "#25D366", boxShadow: "0 4px 12px rgba(37,211,102,0.3)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFF">
              <path d="M12 2.6a9.3 9.3 0 00-7.9 14.2L2.7 21.4l4.7-1.3A9.3 9.3 0 1012 2.6zm5.3 13c-.2.6-1.2 1.2-1.9 1.2-1.7 0-4.2-1.4-5.8-3.1-1.3-1.4-2.2-3.2-2.2-4.4 0-.8.5-1.6 1-1.9.3-.2.9-.2 1.1.1l1.1 1.8c.1.3.1.5-.1.8l-.5.6c-.2.2-.2.4-.1.6.5 1.1 1.6 2.2 2.7 2.7.2.1.5.1.6-.1l.6-.6c.2-.2.5-.3.8-.2l1.8 1c.3.2.3.8 0 1.5z" />
            </svg>
            <span className="text-[12px] font-bold text-white">WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
