import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AdminSignupForm from "@/components/auth/AdminSignupForm";
import AgentSignupInfo from "@/components/auth/AgentSignupInfo";
import FaqAccordion from "@/components/home/FaqAccordion";
import { connectToDatabase } from "@/lib/mongodb";
import { Agent } from "@/models/Agent";
import { SITE_URL } from "@/lib/site-config";

const PAGE_TITLE = "Join UmrahJao as an Agent — Register Your Umrah & Hajj Agency";
const PAGE_DESCRIPTION =
  "Join UmrahJao as a verified Umrah or Hajj travel agent. Register for free, complete GST verification, and get listed to reach pilgrims searching for trusted agents in your city.";

export const metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "join umrahjao",
    "umrahjao agent registration",
    "partner with umrahjao",
    "become umrahjao agent",
    "list your agency umrahjao",
    "register as umrah agent",
    "umrah agent signup",
  ],
  alternates: { canonical: "/admin/signup" },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/admin/signup",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

const SIGNUP_FAQS = [
  {
    question: "How do I join UmrahJao as an agent?",
    answer:
      "Go to umrahjao.com/admin/signup, create your account with your mobile number and email, then submit your agency's GST number and verification certificate. Once our team manually reviews and approves your documents, you go live with a Verified badge.",
  },
  {
    question: "Is it free to join UmrahJao as an agent?",
    answer:
      "Yes. Listing your agency on UmrahJao is completely free, with no listing fee and no commission on any booking, ever.",
  },
  {
    question: "What documents do I need to register as an agent?",
    answer:
      "You need your business identity details, your GST registration number, and a verification certificate for your travel agency, which our team reviews manually before you're listed.",
  },
];

const signupFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: SIGNUP_FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Join as an Agent", item: `${SITE_URL}/admin/signup` },
  ],
};

// Cheap enough to run per-request without a dedicated `revalidate` — same
// query pattern as the homepage's stats badge (see app/page.tsx).
async function getAgentStats() {
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

export default async function AdminSignupPage() {
  const { agentCount, cityCount } = await getAgentStats();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([signupFaqJsonLd, breadcrumbJsonLd]) }}
      />
      <SiteHeader showAgentDashboardLink={false} />
      <main className="flex-1 bg-emerald-50/40 px-4 py-12 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-start">
          <AgentSignupInfo agentCount={agentCount} cityCount={cityCount} />
          <div className="mx-auto w-full max-w-md lg:sticky lg:top-24 lg:mx-0">
            <AdminSignupForm />
          </div>
        </div>

        <div className="mx-auto mt-4 max-w-6xl lg:grid lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-950">
              Common questions about joining as an agent
            </h2>
            <FaqAccordion faqs={SIGNUP_FAQS} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
