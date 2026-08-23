import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Agent } from "@/models/Agent";
import { User } from "@/models/User";
import LogoutButton from "@/components/LogoutButton";
import NavLink from "@/components/superadmin/NavLink";

const jakarta = { fontFamily: "var(--font-jakarta), sans-serif" };

async function getNavCounts() {
  await connectToDatabase();
  const [pending, verified, rejected] = await Promise.all([
    Agent.countDocuments({ verificationStatus: "PENDING" }),
    Agent.countDocuments({ verificationStatus: "VERIFIED" }),
    Agent.countDocuments({ verificationStatus: "REJECTED" }),
  ]);
  return { pending, verified, rejected };
}

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }
  if (session.role !== "SUPERADMIN") {
    redirect(session.role === "ADMIN" ? "/admin/dashboard" : "/");
  }

  await connectToDatabase();
  const [staff, counts] = await Promise.all([
    User.findById(session.userId).lean<{ name: string; email: string } | null>(),
    getNavCounts(),
  ]);

  const NAV_ITEMS = [
    { href: "/superadmin/dashboard", label: "Overview", icon: "◈" },
    { href: "/superadmin/agents/new", label: "Add Agent", icon: "＋" },
    { href: "/superadmin/agents/requests", label: "Agent Requests", icon: "◔", count: counts.pending, tone: "pending" as const },
    { href: "/superadmin/agents/verified", label: "Verified Agents", icon: "✓", count: counts.verified, tone: "neutral" as const },
    { href: "/superadmin/agents/rejected", label: "Rejected Agents", icon: "✕", count: counts.rejected, tone: "neutral" as const },
    { href: "/superadmin/users", label: "Users", icon: "☰" },
  ];

  const initial = (staff?.name?.trim()?.[0] || "S").toUpperCase();

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-white p-[26px] pb-[60px] sm:flex-row" style={jakarta}>
      <aside className="neu-raised flex shrink-0 flex-col gap-1.5 rounded-[26px] bg-white p-[18px] sm:sticky sm:top-[26px] sm:w-[244px] sm:self-start">
        <Link href="/superadmin/dashboard" className="flex items-center gap-2.5 px-1.5 pb-4 pt-1">
          <div className="neu-pressed grid h-10 w-10 shrink-0 place-items-center rounded-[14px]">
            <span style={{ fontFamily: "var(--font-amiri), serif" }} className="text-lg text-[#0E5B4A]">
              ع
            </span>
          </div>
          <div>
            <div className="text-[15px] font-extrabold tracking-tight text-[#24201A]">UmrahJao</div>
            <div className="mt-0.5 text-[9px] font-bold tracking-[0.14em] text-[#8A7F6C]">SUPERADMIN PANEL</div>
          </div>
        </Link>

        <nav className="flex flex-col gap-[7px]">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        <div className="neu-pressed mt-5 rounded-[18px] p-3.5">
          <div className="flex items-center gap-2.5">
            <div
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[12.5px] font-extrabold text-[#F6E2B4]"
              style={{ background: "#1D6FD8" }}
            >
              {initial}
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-bold text-[#24201A]">{staff?.name || "Superadmin"}</div>
              <div className="truncate text-[10px] text-[#9A907C]">{staff?.email || ""}</div>
            </div>
          </div>
        </div>

        <LogoutButton className="neu-raised-sm mt-2.5 flex items-center justify-center gap-2 rounded-[14px] px-3 py-3 text-[12.5px] font-bold text-[#6E6455]" />
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
