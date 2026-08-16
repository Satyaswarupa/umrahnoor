import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AdminLoginForm from "@/components/auth/AdminLoginForm";

export const metadata = { title: "Agent Login | UmrahNoor" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center bg-emerald-50/40 px-4 py-12">
        <AdminLoginForm />
      </main>
      <SiteFooter />
    </div>
  );
}
