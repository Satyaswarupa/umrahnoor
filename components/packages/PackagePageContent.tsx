import { Suspense } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingWidgets from "@/components/FloatingWidgets";
import PackageSearch from "@/components/packages/PackageSearch";
import PackageAgentsGrid from "@/components/packages/PackageAgentsGrid";

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

export default function PackagePageContent({
  serviceSlug,
  packageName,
  packageLabel,
}: {
  serviceSlug: string;
  /** e.g. "Hajj" — used in "Find Your Perfect {packageName} Package" */
  packageName: string;
  /** e.g. "Hajj Package" — used in agent-grid copy */
  packageLabel: string;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <SiteHeader />

      <main className="flex-1" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
        <section className="mx-auto max-w-3xl px-4 pb-2 pt-16 text-center sm:px-6">
          <h1 className="text-[30px] font-extrabold tracking-tight text-[#24201A] sm:text-[38px]">
            Find Your Perfect {packageName} Package
          </h1>
          <p className="mt-3 text-sm leading-[1.7] text-[#7A705E]">
            Trusted by thousands of pilgrims across India. Begin your sacred journey with
            confidence.
          </p>

          <div className="mt-2 flex justify-center">
            <PackageSearch serviceSlug={serviceSlug} />
          </div>
        </section>

        <Suspense fallback={<AgentsGridSkeleton />}>
          <PackageAgentsGrid serviceSlug={serviceSlug} packageLabel={packageLabel} />
        </Suspense>
      </main>

      <SiteFooter />
      <FloatingWidgets />
    </div>
  );
}
