import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import EmailLoginForm from "@/components/auth/EmailLoginForm";

export const metadata = {
  title: "Agent Login with Email",
  description: "Log in to your UmrahJao agent dashboard with email and password.",
  robots: { index: false, follow: true },
};

export default function AdminEmailLoginPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center bg-emerald-50/40 px-4 py-12">
        <EmailLoginForm portal="admin" />
      </main>
      <SiteFooter />
    </div>
  );
}
