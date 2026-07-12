import type { Metadata } from "next";
import { SolutionsLanding } from "@/components/solutions/solutions-landing";
import { BRAND } from "@/lib/branding";

export const metadata: Metadata = {
  title: `Bobkat IT Solutions | ${BRAND.companyName}`,
  description:
    "Explore Bobkat IT solution families for small businesses, growing organizations, and manufacturing operations.",
  alternates: {
    canonical: "/solutions",
  },
  openGraph: {
    title: `Bobkat IT Solutions | ${BRAND.companyName}`,
    description:
      "Enterprise thinking, right-sized for your business with standardized Bobkat IT solution families.",
    url: "/solutions",
    type: "website",
  },
};

export default function SolutionsPage() {
  return <SolutionsLanding />;
}
