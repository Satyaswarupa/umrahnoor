import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Agent } from "@/models/Agent";

async function getStats() {
  await connectToDatabase();
  const [totalUsers, totalAgents, pendingAgents, verifiedAgents, rejectedAgents] =
    await Promise.all([
      User.countDocuments({ role: "USER" }),
      Agent.countDocuments({}),
      Agent.countDocuments({ verificationStatus: "PENDING" }),
      Agent.countDocuments({ verificationStatus: "VERIFIED" }),
      Agent.countDocuments({ verificationStatus: "REJECTED" }),
    ]);
  return { totalUsers, totalAgents, pendingAgents, verifiedAgents, rejectedAgents };
}

export default async function SuperadminOverviewPage() {
  const stats = await getStats();

  const cards = [
    { label: "Total Users", value: stats.totalUsers, href: "/superadmin/users" },
    { label: "Total Agents", value: stats.totalAgents, href: "/superadmin/agents/requests" },
    { label: "Pending Agent Requests", value: stats.pendingAgents, href: "/superadmin/agents/requests" },
    { label: "Verified Agents", value: stats.verifiedAgents, href: "/superadmin/agents/verified" },
    { label: "Rejected Agents", value: stats.rejectedAgents, href: "/superadmin/agents/rejected" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-emerald-950">Overview</h1>
      <p className="mt-1 text-sm text-emerald-900/70">
        A snapshot of UmrahNoor&rsquo;s users and agent verification pipeline.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-emerald-900/10 transition hover:shadow-md"
          >
            <p className="text-sm font-medium text-emerald-900/60">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-emerald-950">{card.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
