import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

const NAV_ITEMS = [
  { href: "/superadmin/dashboard", label: "Overview" },
  { href: "/superadmin/agents/new", label: "Add Agent" },
  { href: "/superadmin/agents/requests", label: "Agent Requests" },
  { href: "/superadmin/agents/verified", label: "Verified Agents" },
  { href: "/superadmin/agents/rejected", label: "Rejected Agents" },
  { href: "/superadmin/users", label: "Users" },
];

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }
  if (session.role !== "SUPERADMIN") {
    redirect(session.role === "ADMIN" ? "/admin/dashboard" : "/");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-emerald-50/40 sm:flex-row">
      <aside className="border-b border-emerald-900/10 bg-emerald-950 text-white sm:min-h-full sm:w-64 sm:border-b-0 sm:border-r">
        <div className="px-6 py-5">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="UmrahChal logo" width={32} height={32} className="h-8 w-8 rounded-full" />
            <span className="text-base font-semibold">UmrahChal</span>
          </Link>
          <p className="mt-1 text-xs text-emerald-200/70">Superadmin Panel</p>
        </div>
        <nav className="flex flex-row flex-wrap gap-1 px-3 pb-4 sm:flex-col">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-emerald-100 hover:bg-white/10"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 px-6 py-4">
          <LogoutButton className="text-sm font-medium text-emerald-100 hover:text-white" />
        </div>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
