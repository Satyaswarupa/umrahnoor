import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Agent } from "@/models/Agent";
import PageHeader from "@/components/superadmin/PageHeader";

async function getStats() {
  await connectToDatabase();
  const [totalUsers, totalAgents, incompleteAgents, pendingAgents, verifiedAgents, rejectedAgents] =
    await Promise.all([
      User.countDocuments({ role: "USER" }),
      Agent.countDocuments({}),
      Agent.countDocuments({ verificationStatus: "INCOMPLETE" }),
      Agent.countDocuments({ verificationStatus: "PENDING" }),
      Agent.countDocuments({ verificationStatus: "VERIFIED" }),
      Agent.countDocuments({ verificationStatus: "REJECTED" }),
    ]);
  return { totalUsers, totalAgents, incompleteAgents, pendingAgents, verifiedAgents, rejectedAgents };
}

// Agents actually waiting on a superadmin, not staged demo rows — pending
// applications missing the one document that blocks approval, oldest first.
async function getNeedsAttention() {
  await connectToDatabase();
  const agents = await Agent.find({
    verificationStatus: "PENDING",
    govIdDocument: null,
    $or: [{ gstDocument: null }, { certificateDocument: null }],
  })
    .select("companyName createdAt")
    .sort({ createdAt: 1 })
    .limit(3)
    .lean();
  return agents.map((a) => ({
    id: String(a._id),
    name: a.companyName || "Untitled Agency",
    note: `Government ID missing · applied ${a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "recently"}`,
  }));
}

export default async function SuperadminOverviewPage() {
  const [stats, attention] = await Promise.all([getStats(), getNeedsAttention()]);

  const pipeline = [
    { label: "Incomplete", n: stats.incompleteAgents, note: "signed up, not submitted", c: "#8A7F6C" },
    { label: "Pending", n: stats.pendingAgents, note: "awaiting review", c: "#C08A2E" },
    { label: "Verified", n: stats.verifiedAgents, note: "live on the site", c: "#0E5B4A" },
    { label: "Rejected", n: stats.rejectedAgents, note: "reason sent", c: "#C0392B" },
  ];

  const cards = [
    { label: "TOTAL USERS", value: stats.totalUsers, href: "/superadmin/users", cta: "View users", color: "#24201A" },
    { label: "TOTAL AGENTS", value: stats.totalAgents, href: "/superadmin/agents/verified", cta: "View agents", color: "#24201A" },
    { label: "PENDING REQUESTS", value: stats.pendingAgents, href: "/superadmin/agents/requests", cta: "Review queue", color: "#8A5A12" },
    { label: "VERIFIED AGENTS", value: stats.verifiedAgents, href: "/superadmin/agents/verified", cta: "View verified", color: "#0A4438" },
    { label: "REJECTED AGENTS", value: stats.rejectedAgents, href: "/superadmin/agents/rejected", cta: "View rejected", color: "#A0301F" },
  ];

  return (
    <>
      <PageHeader
        crumb="DASHBOARD"
        title="Overview"
        subtitle="A snapshot of UmrahJao's users and agent verification pipeline"
      />

      <div className="mt-[26px] flex flex-col gap-[22px]">
        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-5">
          {cards.map((card) => (
            <Link key={card.label} href={card.href} className="neu-raised rounded-3xl bg-white p-[22px] transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold tracking-[0.06em] text-[#8A7F6C]">{card.label}</span>
                <span className="h-2 w-2 rounded-full" style={{ background: card.color, opacity: 0.5 }} />
              </div>
              <div className="mt-3.5 text-[34px] font-extrabold tracking-tight" style={{ color: card.color }}>
                {card.value}
              </div>
              <div className="mt-2.5 text-[11.5px] font-bold text-[#0E5B4A]">{card.cta} →</div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-[22px] lg:grid-cols-[1.45fr_1fr]">
          <div className="neu-raised rounded-3xl bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="text-[15px] font-extrabold text-[#24201A]">Verification pipeline</div>
              <Link href="/superadmin/agents/requests" className="text-xs font-bold text-[#0E5B4A]">
                Open queue →
              </Link>
            </div>
            <div className="neu-pressed mt-[18px] flex h-3 overflow-hidden rounded-full">
              {pipeline.map((p) => (
                <div key={p.label} style={{ flex: p.n || 0.001, background: p.c }} />
              ))}
            </div>
            <div className="mt-[18px] grid grid-cols-2 gap-3 sm:grid-cols-4">
              {pipeline.map((p) => (
                <div key={p.label}>
                  <div className="flex items-center gap-[7px]">
                    <span className="h-2 w-2 rounded-full" style={{ background: p.c }} />
                    <span className="text-[11px] font-bold text-[#6E6455]">{p.label}</span>
                  </div>
                  <div className="mt-1.5 text-xl font-extrabold text-[#24201A]">{p.n}</div>
                  <div className="mt-0.5 text-[10.5px] text-[#9A907C]">{p.note}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="neu-raised rounded-3xl bg-white p-6">
            <div className="text-[15px] font-extrabold text-[#24201A]">Needs your attention</div>
            <div className="mt-4 flex flex-col gap-3">
              {attention.length === 0 ? (
                <p className="text-[12.5px] text-[#8A7F6C]">
                  All caught up — no pending agents are missing their Government ID document.
                </p>
              ) : (
                attention.map((a) => (
                  <div key={a.id} className="neu-pressed flex items-center gap-3 rounded-2xl p-[13px]">
                    <span className="h-[34px] w-1 shrink-0 rounded-full" style={{ background: "#C0392B" }} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12.5px] font-bold text-[#24201A]">{a.name}</div>
                      <div className="mt-0.5 text-[10.5px] text-[#8A7F6C]">{a.note}</div>
                    </div>
                    <Link href="/superadmin/agents/requests" className="shrink-0 text-[11px] font-bold text-[#0E5B4A]">
                      Review
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
