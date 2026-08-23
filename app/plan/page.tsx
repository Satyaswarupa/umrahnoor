import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Plan Your Journey",
  description: "A guided trip planner for Hajj, Umrah, and Zyarat — coming soon.",
  alternates: { canonical: "/plan" },
};

export default function PlanPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <SiteHeader />

      <main className="flex flex-1 items-center justify-center px-4 py-24" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
        <div className="neu-raised-sm max-w-md rounded-[26px] bg-white p-9 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl" style={{ background: "#F4F2EC" }}>
            <span className="text-2xl">🗓️</span>
          </div>
          <h1 className="mt-4 text-[22px] font-extrabold tracking-tight text-[#24201A]">
            A guided trip planner is coming soon
          </h1>
          <p className="mt-3 text-sm leading-[1.7] text-[#7A705E]">
            We&apos;re building a step-by-step planner to help you choose between Hajj, Umrah, and
            Zyarat packages. In the meantime, browse verified agents directly.
          </p>
          <Link
            href="/umrah-package"
            className="mt-6 inline-block rounded-2xl px-6 py-3 text-sm font-bold text-[#F3EFE6] shadow-sm"
            style={{ background: "#1D6FD8" }}
          >
            Browse Umrah Packages
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
