import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SignupForm from "@/components/auth/SignupForm";

export const metadata = {
  title: "Sign Up",
  description: "Create a free UmrahChal account to save and contact verified Umrah travel agents.",
  robots: { index: false, follow: true },
};

export default function SignupPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center bg-emerald-50/40 px-4 py-12">
        <SignupForm />
      </main>
      <SiteFooter />
    </div>
  );
}
