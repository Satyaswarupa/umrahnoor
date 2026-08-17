import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function SiteHeader() {
  const session = await getSession();

  return (
    <header
      className="sticky top-0 z-40 border-b border-white/70 bg-[#EAE5DB]/90 backdrop-blur-md"
      style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-6 px-4 py-3.5 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="UmrahChal logo" width={40} height={40} className="h-10 w-10 rounded-[14px]" priority />
          <div className="text-[16px] font-extrabold tracking-tight text-[#24201A]">UmrahChal</div>
        </Link>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <Link
            href="/admin/signup"
            className="neu-raised-sm rounded-full bg-[#EAE5DB] px-4 py-2.5 text-[13px] font-bold text-[#6E6455] transition hover:text-[#0E5B4A]"
          >
            List your agency
          </Link>

          {!session && (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-[#4A4238] hover:text-[#0E5B4A]"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full px-5 py-2.5 text-[13px] font-bold text-[#F3EFE6] shadow-sm"
                style={{ background: "linear-gradient(145deg, #0E5B4A, #0A4438)" }}
              >
                Sign Up
              </Link>
            </>
          )}

          {session?.role === "USER" && (
            <>
              <span className="hidden text-sm text-[#6E6455] sm:inline">Welcome back</span>
              <LogoutButton />
            </>
          )}

          {session?.role === "ADMIN" && (
            <>
              <Link
                href="/admin/dashboard"
                className="rounded-full px-5 py-2.5 text-[13px] font-bold text-[#F3EFE6] shadow-sm"
                style={{ background: "linear-gradient(145deg, #0E5B4A, #0A4438)" }}
              >
                Agent Dashboard
              </Link>
              <LogoutButton />
            </>
          )}

          {session?.role === "SUPERADMIN" && (
            <>
              <Link
                href="/superadmin/dashboard"
                className="rounded-full px-5 py-2.5 text-[13px] font-bold text-[#F3EFE6] shadow-sm"
                style={{ background: "linear-gradient(145deg, #0E5B4A, #0A4438)" }}
              >
                Superadmin Dashboard
              </Link>
              <LogoutButton />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
