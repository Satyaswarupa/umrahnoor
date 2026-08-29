import Link from "next/link";
import { toWhatsappLink } from "@/lib/contact-links";
import { SUPPORT_WHATSAPP_NUMBER } from "@/lib/site-config";

const STEPS = [
  {
    title: "Create your account",
    text: "Sign up with your mobile number and email, then verify with a one-time OTP.",
  },
  {
    title: "Add your business details",
    text: "Tell us your agency name, GST number, cities you serve, and the services you offer.",
  },
  {
    title: "Upload your certificate",
    text: "Submit your travel agency license or verification certificate for review.",
  },
  {
    title: "Get verified & go live",
    text: "Our team manually reviews your documents. Once approved, pilgrims can find and contact you directly.",
  },
];

const BENEFITS = [
  "Free forever — no listing fee",
  "No commission on any booking",
  "Reach pilgrims across India",
  "Verified badge builds trust",
  "Manage your profile from a dashboard",
  "Pilgrims contact you directly by call or WhatsApp",
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

export default function AgentSignupInfo({
  agentCount,
  cityCount,
}: {
  agentCount: number;
  cityCount: number;
}) {
  return (
    <div>
      <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-emerald-800">
        For Travel Agencies
      </span>

      <h1 className="mt-4 text-[28px] font-extrabold leading-tight tracking-tight text-emerald-950 sm:text-[34px]">
        Join UmrahJao as a verified Umrah &amp; Hajj travel agent
      </h1>
      <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-emerald-900/70">
        Partner with UmrahJao — a free, GST-verified directory built for travel agencies.
        Register once, get manually verified, and let pilgrims searching in your city call or WhatsApp you
        directly — no middlemen, no commission, ever.
      </p>

      {agentCount > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full border border-emerald-900/10 bg-white px-3.5 py-1.5 text-xs font-semibold text-emerald-900">
            {agentCount}+ verified agents already listed
          </span>
          {cityCount > 0 && (
            <span className="rounded-full border border-emerald-900/10 bg-white px-3.5 py-1.5 text-xs font-semibold text-emerald-900">
              {cityCount}+ cities covered
            </span>
          )}
        </div>
      )}

      <div className="mt-9">
        <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-950">
          How registration works
        </h2>
        <ol className="mt-4 space-y-5">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-3.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-900 text-xs font-bold text-white">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-bold text-emerald-950">{step.title}</p>
                <p className="mt-0.5 text-[13.5px] leading-relaxed text-emerald-900/65">
                  {step.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-9 rounded-2xl border border-emerald-900/10 bg-white p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-950">
          Why agencies list on UmrahJao
        </h2>
        <ul className="mt-3.5 grid gap-x-4 gap-y-2.5 sm:grid-cols-2">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2 text-[13.5px] text-emerald-900/80">
              <CheckIcon />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-6 text-[13px] text-emerald-900/60">
        Need help registering?{" "}
        <Link
          href={toWhatsappLink(SUPPORT_WHATSAPP_NUMBER)}
          target="_blank"
          className="font-semibold text-emerald-800 hover:text-emerald-600"
        >
          Chat with our support team on WhatsApp
        </Link>
        .
      </p>
    </div>
  );
}
