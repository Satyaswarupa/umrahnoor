import { Suspense } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingWidgets from "@/components/FloatingWidgets";
import HeroSearch from "@/components/home/HeroSearch";
import TypewriterText from "@/components/home/TypewriterText";
import ServicesShowcase from "@/components/home/ServicesShowcase";
import ServicePicker from "@/components/home/ServicePicker";
import AgentsGrid from "@/components/home/AgentsGrid";
import TopCities from "@/components/home/TopCities";
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
    question: "What is UmrahJao?",
    answer:
      "UmrahJao is a free, India-wide directory of verified, GST-registered Umrah and Hajj travel agents. It's built for pilgrims who want to find and contact a trustworthy local agent directly — UmrahJao itself does not sell packages, process bookings, or take any commission.",
  },
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
  {
    question: "Is UmrahJao also known by other names?",
    answer:
      "Yes — people also search for us as Umrah Jao, Umrajao, UmrahChalo, Umrah Chalo, or Umrahjaa. All of these refer to the same website, umrahjao.com.",
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

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to find and contact a verified Umrah agent on UmrahJao",
  description:
    "Three steps to find, compare, and directly contact a verified Umrah travel agent in India.",
  step: HOW_IT_WORKS.map((item, index) => ({
    "@type": "HowToStep",
    position: index + 1,
    name: item.step,
    text: item.text,
  })),
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
        <section
          className="relative overflow-hidden bg-cover bg-center px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-28 lg:flex lg:min-h-[680px] lg:items-center lg:pb-0 lg:pt-0"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(10,12,16,.35) 0%, rgba(10,12,16,.55) 55%, rgba(10,12,16,.85) 100%), url('https://i.ibb.co/j9N4C30C/pexels-earth-photart-2149767641-35315917-1.jpg')",
          }}
        >
          <div className="relative z-10 mx-auto w-full max-w-6xl">
            <div className="flex max-w-2xl flex-col items-start text-left">
              <div className="inline-flex items-center gap-2.5 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <span className="h-[7px] w-[7px] rounded-full bg-[#25D366]" />
                <span className="text-[11px] font-bold tracking-[0.08em] text-white/90">
                  {stats.agentCount} VERIFIED AGENTS · {stats.cityCount} CITIES
                </span>
              </div>

              <h1 className="mt-5 text-[38px] font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-md sm:text-[54px]">
                Book Your Umrah Journey
                <br />
                <span className="inline-block min-h-[2.3em] align-top">
                  With{" "}
                  <TypewriterText
                    phrases={["Verified Agents", "Trusted Agents", "Affordable Packages"]}
                    className="text-[#EAC831]"
                  />
                </span>
              </h1>

              <p className="mt-4 text-[14px] font-bold tracking-wide text-[#F6E2B4] sm:text-[15px]">
                Affordable Packages • Verified Services • Hassle-Free Booking
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href="#agents"
                  className="rounded-2xl px-6 py-3.5 text-sm font-bold text-[#F3EFE6] shadow-sm"
                  style={{ background: "#CCAE2C" }}
                >
                  Get Best Umrah Deals
                </a>
                <Link
                  href="/admin/signup"
                  className="rounded-2xl border border-white/40 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm"
                >
                  Become a Partner
                </Link>
              </div>

              <HeroSearch />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 pt-10 sm:px-6" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
          <p className="text-[15px] leading-[1.7] text-[#4A4238]">
            <strong>UmrahJao</strong> is a free, India-wide directory of{" "}
            <strong>
              {stats.agentCount}+ verified, GST-registered Umrah and Hajj travel agents
            </strong>{" "}
            across {stats.cityCount}+ cities. It&apos;s built for pilgrims and families across
            India who want to book directly with a licensed local agent instead of an unverified
            reseller — search your city, compare verified agents, then call or WhatsApp the one
            you choose. No account, no booking fee, no middleman.
          </p>
        </section>

        <Suspense fallback={<AgentsGridSkeleton />}>
          <AgentsGrid initialAgents={featuredAgents} />
        </Suspense>

        <TopCities />

        <ServicesShowcase />

        <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
          />
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

        <Suspense fallback={<ServicePickerSkeleton />}>
          <ServicePicker />
        </Suspense>

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
      <FloatingWidgets />
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

// ServicePicker also reads the search query params (useSearchParams) to
// highlight the active service filter, so it needs the same Suspense boundary.
function ServicePickerSkeleton() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
      <div className="h-8 w-56 animate-pulse rounded-full bg-[#F4F2EC]" />
      <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="neu-raised-sm h-32 animate-pulse rounded-[26px] bg-[#F4F2EC]" />
        ))}
      </div>
    </section>
  );
}
