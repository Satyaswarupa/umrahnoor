"use client";

import { useState } from "react";

type Faq = { question: string; answer: string };

export default function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mt-9 space-y-4">
      {faqs.map((faq, index) => {
        const open = openIndex === index;
        return (
          <div
            key={faq.question}
            className="neu-raised-sm overflow-hidden rounded-[22px] bg-white transition-colors duration-300"
            style={open ? { borderColor: "rgba(6,4,42,0.3)" } : undefined}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : index)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="font-bold text-[#24201A]">{faq.question}</span>
              <span
                className={
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#1D6FD8] text-white transition-transform duration-300" +
                  (open ? " rotate-45" : "")
                }
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </button>

            <div
              className="grid transition-[grid-template-rows] duration-300 ease-in-out"
              style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-5 text-sm leading-[1.6] text-[#7A705E]">{faq.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
