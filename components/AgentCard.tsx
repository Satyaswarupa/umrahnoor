import Link from "next/link";
import VerifiedBadge from "@/components/VerifiedBadge";
import { toWhatsappLink, toTelLink } from "@/lib/contact-links";

export type AgentSummary = {
  id: string;
  companyName: string;
  mobileNumber: string;
  whatsappNumber: string;
  country: string;
  state: string;
  city: string;
  description: string;
};

export default function AgentCard({ agent }: { agent: AgentSummary }) {
  return (
    <div className="flex flex-col rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-emerald-950">{agent.companyName}</h3>
        <VerifiedBadge />
      </div>

      <p className="mt-1 text-sm text-emerald-900/70">
        {agent.city}, {agent.state}
      </p>

      {agent.description && (
        <p className="mt-3 line-clamp-3 text-sm text-emerald-900/80">{agent.description}</p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-2">
        <a
          href={toTelLink(agent.mobileNumber)}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-800 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Call
        </a>
        <a
          href={toWhatsappLink(agent.whatsappNumber, agent.companyName)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-2 text-sm font-semibold text-white hover:brightness-95"
        >
          WhatsApp
        </a>
      </div>

      <Link
        href={`/agents/${agent.id}`}
        className="mt-3 text-center text-sm font-medium text-emerald-800 hover:text-emerald-600"
      >
        View Details &rarr;
      </Link>
    </div>
  );
}
