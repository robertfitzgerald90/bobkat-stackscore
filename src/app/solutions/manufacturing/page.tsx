import type { Metadata } from "next";
import { SolutionPlaceholderPage } from "@/components/solutions/solution-placeholder-page";
import { BRAND } from "@/lib/branding";

export const metadata: Metadata = {
  title: `Bobkat Manufacturing | ${BRAND.companyName}`,
  description:
    "Bobkat Manufacturing is a standardized technology solution for industrial and production environments.",
};

export default function ManufacturingSolutionPage() {
  return (
    <SolutionPlaceholderPage
      title="Bobkat Manufacturing"
      description="Technology built for industrial operations. A dedicated solution page will be added here."
    />
  );
}
