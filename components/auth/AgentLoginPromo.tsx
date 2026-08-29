import Link from "next/link";

const BENEFITS = [
  "Free forever — no listing fee or commission",
  "Get discovered by pilgrims searching in your city",
  "Verified badge builds instant trust",
  "Pilgrims call or WhatsApp you directly",
];

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0 text-emerald-600">
      <path
        d="M4 10.5l3.5 3.5L16 5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AgentLoginPromo({ agentCount }: { agentCount: number }) {
  return (
    <div className="w-full max-w-md">
      <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-emerald-800">
        New Agency?
      </span>
      <h2 className="mt-4 text-[24px] font-extrabold leading-tight tracking-tight text-emerald-950 sm:text-[28px]">
        List your Umrah &amp; Hajj agency for free
      </h2>
      <p className="mt-2.5 text-[14.5px] leading-relaxed text-emerald-900/70">
        Join {agentCount > 0 ? `${agentCount}+ verified agencies` : "verified agencies"} already
        reaching pilgrims across India — register, get GST-verified, and go live in a few simple
        steps.
      </p>

      <ul className="mt-5 space-y-2.5">
        {BENEFITS.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2 text-[13.5px] text-emerald-900/80">
            <CheckIcon />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/admin/signup"
        className="mt-6 inline-flex items-center gap-1.5 rounded-lg px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
        style={{ background: "#1D6FD8" }}
      >
        Register your agency
        <span aria-hidden>&rarr;</span>
      </Link>
    </div>
  );
}
