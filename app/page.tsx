import Link from "next/link";
import { Suspense } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AgentPromoWidget from "@/components/AgentPromoWidget";
import WhatsAppFloatButton from "@/components/WhatsAppFloatButton";
import HeroSearch from "@/components/home/HeroSearch";
import ServicesShowcase from "@/components/home/ServicesShowcase";
import ServicePicker from "@/components/home/ServicePicker";
import AgentsGrid from "@/components/home/AgentsGrid";
import AgencyCTA from "@/components/home/AgencyCTA";
import FaqAccordion from "@/components/home/FaqAccordion";
import { connectToDatabase } from "@/lib/mongodb";
import { Agent } from "@/models/Agent";
import { toPublicAgentSummary } from "@/lib/serializers";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site-config";

// Featured agents and the stats badge don't need to be live-fresh on every
// request — cache the rendered page for a minute so repeat visits skip the
// DB round trip entirely instead of re-querying on every load.
export const revalidate = 60;

const HOW_IT_WORKS = [
  {
    step: "1. Search",
    text: "Enter your city or tap Near Me to see verified Umrah agents operating there.",
  },
  {
    step: "2. Compare",
    text: "Check each agent's services, starting price, and years of experience side by side.",
  },
  {
    step: "3. Contact",
    text: "Call or WhatsApp the agent directly to discuss packages and book — no forms, no fees.",
  },
];

const FAQS = [
  {
    question: "Is UmrahJao free to use?",
    answer:
      "Yes. UmrahJao is completely free for pilgrims. There are no booking fees, no commissions, and no middlemen — you contact agents directly.",
  },
  {
    question: "Does UmrahJao book Umrah packages or handle payments?",
    answer:
      "No. UmrahJao is a directory, not a travel agency. We help you find and contact verified Umrah agents; you book and pay the agent directly.",
  },
  {
    question: "How are Umrah agents verified on UmrahJao?",
    answer:
      "Every agent submits their business identity, GST number, and a verification certificate. Our team manually reviews these documents, and only agents that pass review are listed publicly with a Verified badge.",
  },
  {
    question: "How do I contact an Umrah agent on UmrahJao?",
    answer:
      "Browse verified agents on the homepage and use the Call or WhatsApp button on their card to message them directly.",
  },
  {
    question: "Is UmrahJao available across India?",
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

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/#webpage`,
  url: SITE_URL,
  name: `${SITE_NAME} — Find Verified Umrah Travel Agents in India`,
  description: SITE_DESCRIPTION,
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#organization` },
  publisher: { "@id": `${SITE_URL}/#organization` },
  inLanguage: "en-IN",
  audience: {
    "@type": "Audience",
    audienceType: "Pilgrims and families in India planning Umrah travel",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
    },
  ],
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
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
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
              Find & talk to
              <br />
              verified Umrah agents —
              <br />
              <span className="text-[#0E5B4A]">directly.</span>
            </h1>

            <p className="mt-5 max-w-[480px] text-[17px] leading-[1.65] text-[#6E6455]">
              <strong className="text-[#24201A]">In short:</strong> UmrahJao is a free directory
              that connects pilgrims across India with {stats.agentCount} verified, GST-registered
              Umrah agents in {stats.cityCount} cities. Search by city, compare packages, and call
              or WhatsApp any agent yourself — no middlemen, no commission, no booking forms.
            </p>

            <p className="mt-3 max-w-[480px] text-sm leading-[1.6] text-[#8A7F6C]">
              Built for first-time pilgrims, families, and groups in India who want to book Umrah
              packages, visa, air ticket, hotel, or ziyarat services directly with a licensed
              operator instead of going through a travel portal.
            </p>

            <HeroSearch />
          </div>

          <div className="relative">
            <div
              className="h-[420px] rounded-[34px] bg-cover bg-center sm:h-[480px]"
              style={{
                backgroundImage:
                  "url('https://i.ibb.co/DgMyNmPN/pexels-earth-photart-2149767641-35315917.jpg')",
                boxShadow: "0 12px 32px rgba(36,32,26,0.12)",
              }}
            />
            <Link
              href="#agents"
              className="absolute left-5 bottom-6 flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3 shadow-lg sm:left-6 sm:bottom-8 sm:px-5 sm:py-3.5 lg:-left-8 lg:bottom-10"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFF" className="shrink-0">
                <path d="M12 2.6a9.3 9.3 0 00-7.9 14.2L2.7 21.4l4.7-1.3A9.3 9.3 0 1012 2.6zm5.3 13c-.2.6-1.2 1.2-1.9 1.2-1.7 0-4.2-1.4-5.8-3.1-1.3-1.4-2.2-3.2-2.2-4.4 0-.8.5-1.6 1-1.9.3-.2.9-.2 1.1.1l1.1 1.8c.1.3.1.5-.1.8l-.5.6c-.2.2-.2.4-.1.6.5 1.1 1.6 2.2 2.7 2.7.2.1.5.1.6-.1l.6-.6c.2-.2.5-.3.8-.2l1.8 1c.3.2.3.8 0 1.5z" />
              </svg>
              <span className="text-[12px] font-extrabold text-white sm:text-[13px]">WhatsApp an agent</span>
            </Link>
          </div>
        </section>

        <Suspense fallback={<AgentsGridSkeleton />}>
          <AgentsGrid initialAgents={featuredAgents} />
        </Suspense>

        <ServicesShowcase />

        <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
          <h2 className="text-[28px] font-extrabold tracking-tight text-[#24201A] sm:text-[30px]">
            How does UmrahJao work?
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-[1.6] text-[#7A705E]">
            Three steps, no account and no booking fee: search your city, compare verified
            agents, then contact the one you like directly.
          </p>
          <ol className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
              <li key={item.step} className="neu-raised-sm rounded-[26px] bg-white p-6">
                <div className="text-[13px] font-extrabold tracking-wide text-[#0E5B4A]">
                  {item.step}
                </div>
                <p className="mt-2 text-sm leading-[1.6] text-[#6E6455]">{item.text}</p>
              </li>
            ))}
          </ol>
        </section>

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
          <FaqAccordion faqs={FAQS} />
        </section>
      </main>

      <SiteFooter />
      <AgentPromoWidget />
      <WhatsAppFloatButton />
    </div>
  );
}

// AgentsGrid reads the search query params (useSearchParams), which Next.js
// requires a Suspense boundary for — this is its fallback while that resolves.
function AgentsGridSkeleton() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
      <div className="h-8 w-56 animate-pulse rounded-full bg-[#F4F2EC]" />
      <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="neu-raised-sm h-64 animate-pulse rounded-[26px] bg-[#F4F2EC]" />
        ))}
      </div>
    </section>
  );
}
