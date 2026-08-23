import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import LocationBar from "@/components/header/LocationBar";
import DownloadAppButton from "@/components/header/DownloadAppButton";
import PackagesNav from "@/components/header/PackagesNav";
import MobileAgentSearch from "@/components/header/MobileAgentSearch";
import { toTelLink } from "@/lib/contact-links";
import { NAV_MORE_SERVICES, PACKAGES } from "@/lib/services";

const SUPPORT_CALL_NUMBER = "8076731708";

type Session = Awaited<ReturnType<typeof getSession>>;

function NavLinks({
  session,
  className,
  showAgentDashboardLink = true,
}: {
  session: Session;
  className: string;
  showAgentDashboardLink?: boolean;
}) {
  return (
    <div className={className}>
      {!session && (
        <>
          <Link
            href="/signup"
            className="text-center text-sm font-semibold text-[#4A4238] hover:text-[#0E5B4A]"
          >
            Sign Up
          </Link>
          <Link
            href="/login"
            className="rounded-full px-6 py-2.5 text-center text-[13px] font-extrabold uppercase tracking-wide text-white shadow-sm"
            style={{ background: "#15803D" }}
          >
            Login
          </Link>
        </>
      )}

      {session?.role === "USER" && (
        <>
          <span className="text-sm text-[#6E6455]">Welcome back</span>
          <LogoutButton />
        </>
      )}

      {session?.role === "ADMIN" && (
        <>
          {showAgentDashboardLink && (
            <Link
              href="/admin/dashboard"
              className="rounded-full px-5 py-2.5 text-center text-[13px] font-bold text-[#F3EFE6] shadow-sm"
              style={{ background: "#1D6FD8" }}
            >
              Agent Dashboard
            </Link>
          )}
          <LogoutButton />
        </>
      )}

      {session?.role === "SUPERADMIN" && (
        <>
          <Link
            href="/superadmin/dashboard"
            className="rounded-full px-5 py-2.5 text-center text-[13px] font-bold text-[#F3EFE6] shadow-sm"
            style={{ background: "#1D6FD8" }}
          >
            Superadmin Dashboard
          </Link>
          <LogoutButton />
        </>
      )}
    </div>
  );
}

function LocationBarFallback() {
  return <div className="h-[30px] w-[130px] animate-pulse rounded-full bg-[#F4F2EC]" />;
}

function TopBarDivider() {
  return <div className="hidden h-5 w-px shrink-0 bg-black/10 sm:block" />;
}

export default async function SiteHeader({ showAgentDashboardLink = true }: { showAgentDashboardLink?: boolean } = {}) {
  const session = await getSession();

  return (
    <header
      className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/90 backdrop-blur-md"
      style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
    >
      <div className="border-b border-black/[0.06] bg-[#FAFAF8]">
        <div className="relative mx-auto flex max-w-6xl items-center gap-3 px-4 pb-2.5 pt-4 sm:px-6">
          <a
            href={toTelLink(SUPPORT_CALL_NUMBER)}
            className="flex shrink-0 items-center gap-1.5 text-[#4A4238] transition hover:text-[#0E5B4A]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinejoin="round">
              <path d="M6.5 3.5l3 1 1.2 3.6-2 1.6c.7 2.2 2.4 3.9 4.6 4.6l1.6-2 3.6 1.2 1 3c-.4 1.4-1.8 2.3-3.3 2C10.4 18 6 13.6 4.5 6.8c-.3-1.5.6-2.9 2-3.3z" />
            </svg>
            <span className="hidden text-[12.5px] font-bold sm:inline">Call</span>
          </a>

          <TopBarDivider />

          <Suspense fallback={<LocationBarFallback />}>
            <LocationBar />
          </Suspense>

          {/* Centered on the bar as a whole (not the leftover space between the
              side groups), regardless of how wide Call+Location or Plans+Download
              App end up being. */}
          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-4 lg:flex">
            <div className="relative">
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-white" style={{ background: "#4338CA" }}>
                Free Listing
              </span>
              <Link
                href="/admin/signup"
                className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-[#6D63FF] to-[#4338CA] px-4 py-2 text-[12.5px] font-bold text-white shadow-sm transition hover:brightness-105"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" className="shrink-0">
                  <circle cx="12" cy="8" r="3.2" />
                  <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
                </svg>
                Travel Agent? Join Us
              </Link>
            </div>

            <Link href="/blog" className="flex items-center gap-1.5 whitespace-nowrap text-[12.5px] font-bold text-[#4A4238] hover:text-[#0E5B4A]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M21 12a8 8 0 1 1-3.2-6.4L21 4l-1 3.6" />
                <path d="M8 10h8M8 14h5" />
              </svg>
              Blog
            </Link>
          </div>

          <div className="ml-auto hidden items-center gap-4 lg:flex">
            <Link href="/plan" className="flex items-center gap-1.5 whitespace-nowrap text-[12.5px] font-bold text-[#4A4238] hover:text-[#0E5B4A]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <rect x="3" y="5" width="18" height="14" rx="2.5" />
                <path d="M3 10h18" />
              </svg>
              Plans
            </Link>

            <div className="relative">
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-white" style={{ background: "#16A34A" }}>
                New
              </span>
              <DownloadAppButton className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] px-4 py-2 text-[12.5px] font-bold text-white shadow-sm transition hover:brightness-105" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Mobile menu toggle — CSS-only checkbox so the header can stay a server component.
            Must be a direct sibling of the mobile panel below for peer-checked to reach it. */}
        <input type="checkbox" id="mobile-nav-toggle" className="peer hidden" />

        <div className="flex items-center gap-4 py-3.5">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image src="/logo.png" alt="UmrahJao logo" width={32} height={32} className="h-8 w-8 rounded-[10px]" priority />
            <div className="text-[22px] font-extrabold tracking-tight">
              <span className="text-[#151A40]">Umrah</span>
              <span className="text-[#1D6FD8]">Jao</span>
            </div>
          </Link>

          <PackagesNav className="ml-4 hidden items-center gap-6 lg:flex" />

          <form
            action="/"
            className="ml-4 hidden min-w-0 max-w-xs flex-1 items-center gap-2 rounded-full border border-black/10 bg-white pl-4 pr-1.5 py-1.5 lg:flex"
          >
            <input
              name="q"
              placeholder="Search agents…"
              className="min-w-0 flex-1 border-none bg-transparent text-[13px] font-semibold text-[#3A342B] outline-none placeholder:text-[#9A907C]"
            />
            <button
              type="submit"
              aria-label="Search"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
              style={{ background: "#1D6FD8" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M16.5 16.5L21 21" />
              </svg>
            </button>
          </form>

          <NavLinks
            session={session}
            className="ml-auto hidden items-center gap-3 lg:flex"
            showAgentDashboardLink={showAgentDashboardLink}
          />

          <label
            htmlFor="mobile-nav-toggle"
            aria-label="Open menu"
            className="neu-raised-sm ml-auto grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl lg:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#24201A" strokeWidth={2.2} strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </label>
        </div>

        <MobileAgentSearch />

        <div className="hidden flex-col gap-5 border-t border-black/[0.06] pb-5 pt-4 peer-checked:flex lg:hidden">
          <div className="flex flex-col gap-3">
            <div className="text-[10.5px] font-extrabold tracking-[0.1em] text-[#9A907C]">PACKAGES</div>
            <Link href="/#agents" className="text-sm font-bold text-[#4A4238] hover:text-[#0E5B4A]">
              🔎 All Agents
            </Link>
            {PACKAGES.map((pkg) => (
              <Link key={pkg.slug} href={`/${pkg.slug}`} className="text-sm font-bold text-[#4A4238] hover:text-[#0E5B4A]">
                {pkg.icon} {pkg.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <div className="text-[10.5px] font-extrabold tracking-[0.1em] text-[#9A907C]">SERVICES</div>
            <div className="flex flex-wrap gap-2">
              {NAV_MORE_SERVICES.map((service) => (
                <Link
                  key={service.slug}
                  href={`/?service=${service.slug}#agents`}
                  className="neu-raised-sm rounded-full px-3 py-1.5 text-[12px] font-semibold text-[#6E6455]"
                >
                  {service.icon} {service.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="text-[10.5px] font-extrabold tracking-[0.1em] text-[#9A907C]">MORE</div>
            <Link
              href="/admin/signup"
              className="w-fit rounded-full bg-gradient-to-r from-[#6D63FF] to-[#4338CA] px-4 py-2 text-[13px] font-bold text-white shadow-sm"
            >
              Travel Agent? Join Us · Free Listing
            </Link>
            <Link href="/blog" className="text-sm font-bold text-[#4A4238] hover:text-[#0E5B4A]">
              Blog
            </Link>
            <Link href="/plan" className="text-sm font-bold text-[#4A4238] hover:text-[#0E5B4A]">
              Plans
            </Link>
            <DownloadAppButton className="flex w-fit items-center gap-1.5 rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] px-4 py-2 text-[13px] font-bold text-white shadow-sm" />
          </div>

          <NavLinks
            session={session}
            className="flex flex-col gap-3 border-t border-black/[0.06] pt-4"
            showAgentDashboardLink={showAgentDashboardLink}
          />
        </div>
      </div>
    </header>
  );
}
