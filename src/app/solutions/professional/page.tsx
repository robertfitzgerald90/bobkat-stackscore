import type { Metadata } from "next";
import { SolutionPlaceholderPage } from "@/components/solutions/solution-placeholder-page";
import { BRAND } from "@/lib/branding";

export const metadata: Metadata = {
  title: `Bobkat Professional | ${BRAND.companyName}`,
  description:
    "Bobkat Professional is a standardized technology solution for growing organizations that need strategic IT leadership.",
};

export default function ProfessionalSolutionPage() {
  return (
    <SolutionPlaceholderPage
      title="Bobkat Professional"
      description="Strategic technology for growing organizations. A dedicated solution page will be added here."
    />
  );
}
