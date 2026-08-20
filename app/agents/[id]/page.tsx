import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import VerifiedBadge from "@/components/VerifiedBadge";
import { connectToDatabase } from "@/lib/mongodb";
import { Agent } from "@/models/Agent";
import { toPublicAgentDetail } from "@/lib/serializers";
import { toTelLink, toWhatsappLink } from "@/lib/contact-links";
import { getServiceIcon, getServiceLabel } from "@/lib/services";
import { SITE_URL } from "@/lib/site-config";

type Params = Promise<{ id: string }>;

// Agent profiles don't change second-to-second — cache each profile page for
// a few minutes instead of re-querying on every visit.
export const revalidate = 300;

// generateMetadata and the page component both need this agent — cache()
// dedupes the two calls into a single DB query per request instead of two.
const getAgent = cache(async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;

  await connectToDatabase();
  const agent = await Agent.findOne({
    _id: id,
    verificationStatus: "VERIFIED",
    isListed: true,
  }).lean();

  if (!agent) return null;
  return toPublicAgentDetail(agent);
});

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const agent = await getAgent(id);
  if (!agent) return {};

  const locationLabel = [agent.city, agent.state, agent.country].filter(Boolean).join(", ");
  const title = locationLabel ? `${agent.companyName} — Umrah Agent in ${locationLabel}` : agent.companyName;
  const description =
    agent.description ||
    `${agent.companyName} is a verified Umrah travel agent${locationLabel ? ` in ${locationLabel}` : ""}. Contact them directly by call or WhatsApp on UmrahJao.`;

  return {
    title,
    description,
    alternates: { canonical: `/agents/${id}` },
    openGraph: { title, description, url: `/agents/${id}`, type: "profile" },
  };
}

export default async function AgentDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const agent = await getAgent(id);

  if (!agent) notFound();

  const locationLabel = [agent.city, agent.state, agent.country].filter(Boolean).join(", ");

  const travelAgencyJsonLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: agent.companyName,
    description: agent.description || undefined,
    telephone: agent.mobileNumber || undefined,
    address: (agent.address || locationLabel)
      ? {
        "@type": "PostalAddress",
        streetAddress: agent.address || undefined,
        addressLocality: agent.city || undefined,
        addressRegion: agent.state || undefined,
        addressCountry: agent.country || undefined,
      }
      : undefined,
    url: `${SITE_URL}/agents/${agent.id}`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: agent.companyName, item: `${SITE_URL}/agents/${agent.id}` },
    ],
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([travelAgencyJsonLd, breadcrumbJsonLd]) }}
      />
      <div
        className={
          "rounded-2xl bg-white p-8 shadow-sm " +
          (agent.verificationBadge === "GOLD" ? "border-2 border-[#D4A017]/60" : "border border-emerald-900/10")
        }
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-emerald-950">{agent.companyName}</h1>
          <VerifiedBadge badge={agent.verificationBadge} />
        </div>

        <p className="mt-1 text-sm text-emerald-900/70">
          {[agent.city, agent.state, agent.country].filter(Boolean).join(", ")}
        </p>

        {agent.description && (
          <p className="mt-4 text-emerald-900/80">{agent.description}</p>
        )}

        <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-emerald-900/10 pt-6 sm:grid-cols-2">
          {agent.businessType && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-emerald-900/50">
                Business Type
              </dt>
              <dd className="mt-1 text-sm text-emerald-950">
                {getServiceIcon(agent.businessType)} {getServiceLabel(agent.businessType)}
              </dd>
            </div>
          )}
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
          {agent.startingPrice != null && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-emerald-900/50">
                Package From
              </dt>
              <dd className="mt-1 text-sm text-emerald-950">
                ₹{agent.startingPrice.toLocaleString("en-IN")}
              </dd>
            </div>
          )}
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
            className="flex items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: "#CCAE2C" }}
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
