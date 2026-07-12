import type { Metadata } from "next";
import { SolutionPlaceholderPage } from "@/components/solutions/solution-placeholder-page";
import { BRAND } from "@/lib/branding";

export const metadata: Metadata = {
  title: `Bobkat Essentials | ${BRAND.companyName}`,
  description:
    "Bobkat Essentials is a standardized technology solution for small businesses that need secure, reliable IT foundations.",
};

export default function EssentialsSolutionPage() {
  return (
    <SolutionPlaceholderPage
      title="Bobkat Essentials"
      description="Secure, reliable technology for small businesses. A dedicated solution page will be added here."
    />
  );
}
