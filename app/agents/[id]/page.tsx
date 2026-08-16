import { notFound } from "next/navigation";
import mongoose from "mongoose";
import VerifiedBadge from "@/components/VerifiedBadge";
import { connectToDatabase } from "@/lib/mongodb";
import { Agent } from "@/models/Agent";
import { toPublicAgentDetail } from "@/lib/serializers";
import { toTelLink, toWhatsappLink } from "@/lib/contact-links";

type Params = Promise<{ id: string }>;

async function getAgent(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;

  await connectToDatabase();
  const agent = await Agent.findOne({
    _id: id,
    verificationStatus: "VERIFIED",
    isListed: true,
  }).lean();

  if (!agent) return null;
  return toPublicAgentDetail(agent);
}

export default async function AgentDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const agent = await getAgent(id);

  if (!agent) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl border border-emerald-900/10 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-emerald-950">{agent.companyName}</h1>
          <VerifiedBadge />
        </div>

        <p className="mt-1 text-sm text-emerald-900/70">
          {[agent.city, agent.state, agent.country].filter(Boolean).join(", ")}
        </p>

        {agent.description && (
          <p className="mt-4 text-emerald-900/80">{agent.description}</p>
        )}

        <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-emerald-900/10 pt-6 sm:grid-cols-2">
          {agent.ownerName && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-emerald-900/50">
                Contact Person
              </dt>
              <dd className="mt-1 text-sm text-emerald-950">{agent.ownerName}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-emerald-900/50">
              Mobile
            </dt>
            <dd className="mt-1 text-sm text-emerald-950">{agent.mobileNumber}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-emerald-900/50">
              WhatsApp
            </dt>
            <dd className="mt-1 text-sm text-emerald-950">{agent.whatsappNumber}</dd>
          </div>
          {agent.address && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-emerald-900/50">
                Address
              </dt>
              <dd className="mt-1 text-sm text-emerald-950">{agent.address}</dd>
            </div>
          )}
        </dl>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <a
            href={toTelLink(agent.mobileNumber)}
            className="flex items-center justify-center rounded-lg bg-emerald-800 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Call Now
          </a>
          <a
            href={toWhatsappLink(agent.whatsappNumber, agent.companyName)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-lg bg-[#25D366] px-4 py-3 text-sm font-semibold text-white hover:brightness-95"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
