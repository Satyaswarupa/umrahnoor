import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import LocationSearchForm from "@/components/LocationSearchForm";
import AgentPromoWidget from "@/components/AgentPromoWidget";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden text-white">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://www.qiblatravels.com/wp-content/uploads/2024/07/Difference-Hajj-and-Umrah-feature.jpg')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-950/60 to-emerald-950/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-transparent to-transparent" />

          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-300">
              Hajj Mubarak
            </p>
            <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Book Your Umrah Journey
              <br />
              With Trusted Agents
            </h1>
            <p className="mt-5 max-w-xl text-lg text-emerald-100/90">
              UmrahNoor connects you with verified Umrah travel agents in your city. Search by
              location, view agent details, and contact them directly by call or WhatsApp.
            </p>

            <div className="mt-10 max-w-3xl">
              <LocationSearchForm variant="hero" />
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/agents"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-900 shadow-sm hover:bg-emerald-50"
              >
                Browse All Agents
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-emerald-950">
            How UmrahNoor Works
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <Step
              number="1"
              title="Search Your Location"
              description="Select your country, state, and city to find Umrah agents operating near you."
            />
            <Step
              number="2"
              title="Review Verified Agents"
              description="Browse company details for agents that have completed UmrahNoor's verification process."
            />
            <Step
              number="3"
              title="Contact Directly"
              description="Call or message the agent on WhatsApp to discuss your Umrah travel plans."
            />
          </div>
        </section>

        <section className="bg-emerald-50">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:items-center">
              <div>
                <h2 className="text-2xl font-bold text-emerald-950">
                  Why UmrahNoor Verification Matters
                </h2>
                <p className="mt-4 text-emerald-900/80">
                  Every agent listed on UmrahNoor has submitted their business details, GST
                  number, and verification documents for review by our team. Only agents that
                  pass this review are listed publicly with a{" "}
                  <span className="font-semibold text-emerald-800">Verified</span> badge.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-emerald-900/80">
                  <li>&bull; Business identity and GST number reviewed</li>
                  <li>&bull; Verification certificate reviewed by our team</li>
                  <li>&bull; Direct contact details, no middlemen or booking fees</li>
                </ul>
              </div>
              <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-emerald-900/10">
                <h3 className="text-lg font-semibold text-emerald-950">
                  Are you an Umrah travel agent?
                </h3>
                <p className="mt-2 text-sm text-emerald-900/70">
                  Register your company on UmrahNoor to reach pilgrims searching for trusted
                  Umrah agents in your city. Complete your verification to get listed.
                </p>
                <Link
                  href="/admin/signup"
                  className="mt-6 inline-block rounded-full bg-emerald-800 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                >
                  Register Your Company
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <AgentPromoWidget />
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-emerald-900/10 p-6">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-800 text-sm font-bold text-white">
        {number}
      </span>
      <h3 className="mt-4 font-semibold text-emerald-950">{title}</h3>
      <p className="mt-2 text-sm text-emerald-900/70">{description}</p>
    </div>
  );
}
