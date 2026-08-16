import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }
  if (session.role !== "ADMIN") {
    redirect(session.role === "SUPERADMIN" ? "/superadmin/dashboard" : "/");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-emerald-50/40">
      <header className="border-b border-emerald-900/10 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-800 text-sm font-bold text-white">
              UN
            </span>
            <span className="text-lg font-semibold tracking-tight text-emerald-950">
              UmrahNoor <span className="font-normal text-emerald-900/60">Agent Dashboard</span>
            </span>
          </Link>
          <LogoutButton className="rounded-full border border-emerald-900/15 px-4 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-50" />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
