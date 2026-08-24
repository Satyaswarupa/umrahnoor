import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import EmailLoginForm from "@/components/auth/EmailLoginForm";

export const metadata = {
  title: "Login with Email",
  description: "Log in to your UmrahJao account with email and password.",
  robots: { index: false, follow: true },
};

export default function EmailLoginPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center bg-emerald-50/40 px-4 py-12">
        <EmailLoginForm portal="user" />
      </main>
      <SiteFooter />
    </div>
  );
}
