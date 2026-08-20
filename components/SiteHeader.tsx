import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

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
      <Link
        href="/admin/signup"
        className="neu-raised-sm rounded-full bg-white px-4 py-2.5 text-center text-[13px] font-bold text-[#6E6455] transition hover:text-[#0E5B4A]"
      >
        List your agency
      </Link>

      {!session && (
        <>
          <Link
            href="/login"
            className="text-center text-sm font-semibold text-[#4A4238] hover:text-[#0E5B4A]"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-full px-5 py-2.5 text-center text-[13px] font-bold text-[#F3EFE6] shadow-sm"
            style={{ background: "#CCAE2C" }}
          >
            Sign Up
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
              style={{ background: "#CCAE2C" }}
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
            style={{ background: "#CCAE2C" }}
          >
            Superadmin Dashboard
          </Link>
          <LogoutButton />
        </>
      )}
    </div>
  );
}

export default async function SiteHeader({ showAgentDashboardLink = true }: { showAgentDashboardLink?: boolean } = {}) {
  const session = await getSession();

  return (
    <header
      className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/90 backdrop-blur-md"
      style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Mobile menu toggle — CSS-only checkbox so the header can stay a server component.
            Must be a direct sibling of the mobile panel below for peer-checked to reach it. */}
        <input type="checkbox" id="mobile-nav-toggle" className="peer hidden" />

        <div className="flex items-center gap-4 py-3.5">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="UmrahJao logo" width={40} height={40} className="h-10 w-10 rounded-[14px]" priority />
            <div className="text-[16px] font-extrabold tracking-tight text-[#24201A]">UmrahJao</div>
          </Link>

          <NavLinks
            session={session}
            className="ml-auto hidden items-center gap-3 sm:flex"
            showAgentDashboardLink={showAgentDashboardLink}
          />

          <label
            htmlFor="mobile-nav-toggle"
            aria-label="Open menu"
            className="neu-raised-sm ml-auto grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl sm:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#24201A" strokeWidth={2.2} strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </label>
        </div>

        <NavLinks
          session={session}
          className="hidden flex-col gap-3 border-t border-black/[0.06] pb-4 pt-4 peer-checked:flex sm:hidden"
          showAgentDashboardLink={showAgentDashboardLink}
        />
      </div>
    </header>
  );
}
