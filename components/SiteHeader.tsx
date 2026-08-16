import Link from "next/link";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="border-b border-emerald-900/10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-800 text-sm font-bold text-white">
            UN
          </span>
          <span className="text-lg font-semibold tracking-tight text-emerald-950">
            UmrahNoor
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-emerald-950/80">
          <Link href="/" className="hover:text-emerald-700">
            Home
          </Link>
          <Link href="/agents" className="hover:text-emerald-700">
            Find Umrah Agents
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {!session && (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-emerald-950/80 hover:text-emerald-700"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-emerald-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                Sign Up
              </Link>
            </>
          )}

          {session?.role === "USER" && (
            <>
              <span className="hidden text-sm text-emerald-950/60 sm:inline">
                Welcome back
              </span>
              <LogoutButton />
            </>
          )}

          {session?.role === "ADMIN" && (
            <>
              <Link
                href="/admin/dashboard"
                className="rounded-full bg-emerald-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
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
                className="rounded-full bg-emerald-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
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
