import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AdminSignupForm from "@/components/auth/AdminSignupForm";

export const metadata = {
  title: "Become a Verified Umrah Agent",
  description:
    "Register your Umrah travel agency on UmrahChal for free. Complete GST and certificate verification to get listed and reach pilgrims searching for trusted agents in your city.",
  alternates: { canonical: "/admin/signup" },
};

export default function AdminSignupPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center bg-emerald-50/40 px-4 py-12">
        <AdminSignupForm />
      </main>
      <SiteFooter />
    </div>
  );
}
