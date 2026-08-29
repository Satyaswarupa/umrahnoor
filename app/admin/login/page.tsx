import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AdminLoginForm from "@/components/auth/AdminLoginForm";
import AgentLoginPromo from "@/components/auth/AgentLoginPromo";
import { connectToDatabase } from "@/lib/mongodb";
import { Agent } from "@/models/Agent";

export const metadata = {
  title: "Agent Login",
  description: "Log in to your UmrahJao agent dashboard to manage your verification and listing.",
  robots: { index: false, follow: true },
};

async function getAgentCount() {
  await connectToDatabase();
  return Agent.countDocuments({ verificationStatus: "VERIFIED", isListed: true });
}

export default async function AdminLoginPage() {
  const agentCount = await getAgentCount();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1 bg-emerald-50/40 px-4 py-12 sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-col-reverse items-center gap-12 lg:flex-row lg:items-start lg:justify-center">
          <AgentLoginPromo agentCount={agentCount} />
          <AdminLoginForm />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
