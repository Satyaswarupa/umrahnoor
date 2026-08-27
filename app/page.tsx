import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingWidgets from "@/components/FloatingWidgets";
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
        <section className="relative overflow-hidden px-4 pb-12 pt-20 sm:px-6 sm:pb-14 sm:pt-24 lg:flex lg:min-h-[580px] lg:items-center lg:pb-16 lg:pt-0">
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src="/hero-mecca.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(100deg, rgba(255,255,255,.6) 0%, rgba(255,255,255,.42) 28%, rgba(255,255,255,.14) 50%, rgba(10,12,16,.08) 68%, rgba(10,12,16,.3) 100%)",
              }}
            />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-6xl">
            <div className="flex max-w-2xl flex-col items-start text-left">
              <div className="inline-flex items-center gap-2.5 rounded-full bg-[#151A40]/[0.06] px-4 py-2">
                <span className="h-[7px] w-[7px] rounded-full bg-[#16A34A]" />
                <span className="text-[11px] font-bold tracking-[0.08em] text-[#151A40]/80">
                  {stats.agentCount} VERIFIED AGENTS · {stats.cityCount} CITIES
                </span>
              </div>

              <div
                className="mt-3 text-[22px] italic text-[#D9A521] sm:text-[26px]"
                style={{ fontFamily: "'Segoe Script', 'Brush Script MT', cursive" }}
              >
                Hajj Mubarak
              </div>

              <h1
                className="mt-1 text-[32px] font-extrabold leading-[1.1] tracking-tight text-[#151A40] sm:text-[44px]"
                style={{ textShadow: "0 2px 20px rgba(255,255,255,0.55)" }}
              >
                Book Your Umrah Journey
                <br />
                <span className="block min-h-[2.3em] align-top sm:min-h-[1.2em]">
                  With{" "}
                  <TypewriterText
                    phrases={["Verified Agents", "Trusted Agents", "Affordable Packages"]}
                    className="text-[#ebf5ec]"
                  />
                </span>
              </h1>

              <p
                className="mt-3 text-[13px] font-bold tracking-wide text-[#151A40] sm:text-[14px]"
                style={{ textShadow: "0 1px 12px rgba(255,255,255,0.8)" }}
              >
                Affordable Packages • Verified Services • Hassle-Free Booking
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a
                  href="#agents"
                  className="flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-sm"
                  style={{ background: "#1D6FD8" }}
                >
                  Get Best Umrah Deals
                  <span aria-hidden>→</span>
                </a>
                <Link
                  href="/admin/signup"
                  className="rounded-2xl border border-[#151A40]/30 px-5 py-3 text-sm font-bold text-[#151A40] backdrop-blur-sm"
                >
                  Become a Partner
                </Link>
              </div>
            </div>
          </div>
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

        <section className="mx-auto max-w-3xl px-4 pt-20 sm:px-6" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
          <div className="neu-raised-sm rounded-[26px] bg-white p-6 text-center sm:p-8">
            <p className="text-[15.5px] leading-[1.85] text-[#4A4238] sm:text-[16.5px]">
              <strong className="text-[#151A40]">UmrahJao</strong> is a free, India-wide directory
              of{" "}
              <span className="font-extrabold text-[#1D6FD8]">
                {stats.agentCount}+ verified, GST-registered
              </span>{" "}
              Umrah and Hajj travel agents across{" "}
              <span className="font-extrabold text-[#1D6FD8]">{stats.cityCount}+ cities</span>.
              It&apos;s built for pilgrims and families across India who want to book directly
              with a licensed local agent instead of an unverified reseller — search your city,
              compare verified agents, then call or WhatsApp the one you choose.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {["No account needed", "No booking fee", "No middleman"].map((item) => (
                <span
                  key={item}
                  className="neu-pressed inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-bold text-[#0E5B4A]"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0E5B4A" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M8.5 12.3l2.3 2.3 4.7-4.9" />
                  </svg>
                  {item}
                </span>
              ))}
            </div>
          </div>
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
