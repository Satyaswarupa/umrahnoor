import type { Metadata } from "next";
import PackagePageContent from "@/components/packages/PackagePageContent";

export const metadata: Metadata = {
  title: "Umrah Packages — Find Verified Umrah Agents in India",
  description:
    "Browse verified Umrah package operators across India. Search by city or use Near Me to find trusted, licensed Umrah agents near you.",
  alternates: { canonical: "/umrah-package" },
};

export default function UmrahPackagePage() {
  return (
    <PackagePageContent
      serviceSlug="umrah-package"
      packageName="Umrah"
      packageLabel="Umrah Package"
    />
  );
}
