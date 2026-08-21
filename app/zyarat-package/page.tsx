import type { Metadata } from "next";
import PackagePageContent from "@/components/packages/PackagePageContent";

export const metadata: Metadata = {
  title: "Zyarat Packages — Find Verified Zyarat Agents in India",
  description:
    "Browse verified Zyarat package operators across India. Search by city or use Near Me to find trusted, licensed Zyarat agents near you.",
  alternates: { canonical: "/zyarat-package" },
};

export default function ZyaratPackagePage() {
  return (
    <PackagePageContent
      serviceSlug="zyarat-package"
      packageName="Zyarat"
      packageLabel="Zyarat Package"
    />
  );
}
