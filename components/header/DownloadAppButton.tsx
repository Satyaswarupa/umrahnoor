"use client";

import { useState } from "react";

export default function DownloadAppButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
        Download App
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="neu-raised w-full max-w-sm rounded-[24px] bg-white p-7 text-center"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl" style={{ background: "#F4F2EC" }}>
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="mt-4 text-[17px] font-extrabold text-[#24201A]">App coming soon</h3>
            <p className="mt-2 text-sm leading-[1.6] text-[#7A705E]">
              The UmrahJao app is on its way. In the meantime, the website works just as well on
              your phone&apos;s browser.
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-5 w-full rounded-2xl px-5 py-3 text-sm font-bold text-[#F3EFE6] shadow-sm"
              style={{ background: "#1D6FD8" }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
