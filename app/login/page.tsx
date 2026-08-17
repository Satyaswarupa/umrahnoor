import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Login",
  description: "Log in to your UmrahChal account to save and contact Umrah travel agents.",
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center bg-emerald-50/40 px-4 py-12">
        <LoginForm />
      </main>
      <SiteFooter />
    </div>
  );
}
