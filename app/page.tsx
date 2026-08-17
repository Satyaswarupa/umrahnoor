import Link from "next/link";
import { Suspense } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AgentPromoWidget from "@/components/AgentPromoWidget";
import HeroSearch from "@/components/home/HeroSearch";
import ServicePicker from "@/components/home/ServicePicker";
import AgentsGrid from "@/components/home/AgentsGrid";
import AgencyCTA from "@/components/home/AgencyCTA";
import { connectToDatabase } from "@/lib/mongodb";
import { Agent } from "@/models/Agent";
import { toPublicAgentSummary } from "@/lib/serializers";

const FAQS = [
  {
    question: "Is UmrahChal free to use?",
    answer:
      "Yes. UmrahChal is completely free for pilgrims. There are no booking fees, no commissions, and no middlemen — you contact agents directly.",
  },
  {
    question: "Does UmrahChal book Umrah packages or handle payments?",
    answer:
      "No. UmrahChal is a directory, not a travel agency. We help you find and contact verified Umrah agents; you book and pay the agent directly.",
  },
  {
    question: "How are Umrah agents verified on UmrahChal?",
    answer:
      "Every agent submits their business identity, GST number, and a verification certificate. Our team manually reviews these documents, and only agents that pass review are listed publicly with a Verified badge.",
  },
  {
    question: "How do I contact an Umrah agent on UmrahChal?",
    answer:
      "Browse verified agents on the homepage and use the Call or WhatsApp button on their card to message them directly.",
  },
  {
    question: "Is UmrahChal available across India?",
    answer:
      "Yes. Use the location search or Near Me on the homepage to see verified Umrah agents in any city or state across India.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

async function getFeaturedAgents() {
  await connectToDatabase();
  const agents = await Agent.find({ verificationStatus: "VERIFIED", isListed: true })
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();
  return agents.map((agent) => toPublicAgentSummary(agent));
}

// Real counts for the hero badge — not hardcoded marketing numbers. Cities
// come from either the legacy top-level `city` or the newer `locations[]`
// (see lib/serializers.ts's pickDisplayLocation for why both exist).
async function getHomeStats() {
  await connectToDatabase();
  const agents = await Agent.find(
    { verificationStatus: "VERIFIED", isListed: true },
    { city: 1, locations: 1 },
  ).lean();

  const cities = new Set<string>();
  for (const agent of agents) {
    if (agent.city) cities.add(agent.city);
    for (const location of agent.locations ?? []) {
      if (location.city) cities.add(location.city);
    }
  }

  return { agentCount: agents.length, cityCount: cities.size };
}

export default async function Home() {
  const [featuredAgents, stats] = await Promise.all([getFeaturedAgents(), getHomeStats()]);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#EAE5DB]">
      <SiteHeader />

      <main className="flex-1" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
        <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 pt-16 sm:px-6 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <div className="neu-pressed inline-flex items-center gap-2.5 rounded-full px-4 py-2">
              <span className="h-[7px] w-[7px] rounded-full bg-[#25D366]" />
              <span className="text-[11px] font-bold tracking-[0.08em] text-[#6E6455]">
                {stats.agentCount} VERIFIED AGENTS · {stats.cityCount} CITIES
              </span>
            </div>

            <h1 className="mt-5 text-[42px] font-extrabold leading-[1.08] tracking-tight text-[#24201A] sm:text-[56px]">
              Talk to the right
              <br />
              Umrah agent —
              <br />
              <span className="text-[#0E5B4A]">directly.</span>
            </h1>

            <p className="mt-5 max-w-[480px] text-[17px] leading-[1.65] text-[#6E6455]">
              No middlemen, no commission, no booking forms. Browse licensed Umrah operators near
              you and call or WhatsApp them yourself — packages, visa, air ticket, hotel, ziyarat.
            </p>

            <HeroSearch />
          </div>

          <div className="relative">
            <div
              className="h-[420px] rounded-[34px] bg-cover bg-center sm:h-[480px]"
              style={{
                backgroundImage:
                  "url('https://i.ibb.co/pvmTrDR1/Gemini-Generated-Image-600zb6600zb6600z.png')",
                boxShadow: "16px 16px 34px rgba(150,138,118,.55), -10px -10px 26px rgba(255,255,255,.9)",
              }}
            />
            <Link
              href="#agents"
              className="neu-raised absolute -left-6 bottom-10 flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-3.5 sm:-left-8"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFF">
                <path d="M12 2.6a9.3 9.3 0 00-7.9 14.2L2.7 21.4l4.7-1.3A9.3 9.3 0 1012 2.6zm5.3 13c-.2.6-1.2 1.2-1.9 1.2-1.7 0-4.2-1.4-5.8-3.1-1.3-1.4-2.2-3.2-2.2-4.4 0-.8.5-1.6 1-1.9.3-.2.9-.2 1.1.1l1.1 1.8c.1.3.1.5-.1.8l-.5.6c-.2.2-.2.4-.1.6.5 1.1 1.6 2.2 2.7 2.7.2.1.5.1.6-.1l.6-.6c.2-.2.5-.3.8-.2l1.8 1c.3.2.3.8 0 1.5z" />
              </svg>
              <span className="text-[13px] font-extrabold text-white">WhatsApp an agent</span>
            </Link>
          </div>
        </section>

        <Suspense fallback={<AgentsGridSkeleton />}>
          <AgentsGrid initialAgents={featuredAgents} />
        </Suspense>

        <ServicePicker />

        <AgencyCTA />

        <section className="mx-auto max-w-3xl px-4 pt-20 sm:px-6" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
          />
          <h2 className="text-center text-[26px] font-extrabold tracking-tight text-[#24201A]">
            Frequently Asked Questions
          </h2>
          <dl className="mt-9 space-y-7">
            {FAQS.map((faq) => (
              <div key={faq.question}>
                <dt className="font-bold text-[#24201A]">{faq.question}</dt>
                <dd className="mt-2 text-sm leading-[1.6] text-[#7A705E]">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>

      <SiteFooter />
      <AgentPromoWidget />
    </div>
  );
}

// AgentsGrid reads the search query params (useSearchParams), which Next.js
// requires a Suspense boundary for — this is its fallback while that resolves.
function AgentsGridSkeleton() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
      <div className="h-8 w-56 animate-pulse rounded-full bg-[#E4DED2]" />
      <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="neu-raised-sm h-64 animate-pulse rounded-[26px] bg-[#E4DED2]" />
        ))}
      </div>
    </section>
  );
}
