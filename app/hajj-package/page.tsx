import type { Metadata } from "next";
import PackagePageContent from "@/components/packages/PackagePageContent";

export const metadata: Metadata = {
  title: "Hajj Packages — Find Verified Hajj Agents in India",
  description:
    "Browse verified Hajj package operators across India. Search by city or use Near Me to find trusted, licensed Hajj agents near you.",
  alternates: { canonical: "/hajj-package" },
};

export default function HajjPackagePage() {
  return (
    <PackagePageContent
      serviceSlug="hajj-package"
      packageName="Hajj"
      packageLabel="Hajj Package"
    />
  );
}
