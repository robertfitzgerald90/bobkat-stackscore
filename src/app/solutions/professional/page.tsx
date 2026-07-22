import type { Metadata } from "next";
import { ProfessionalLanding } from "@/components/solutions/professional-landing";
import { publicAssetUrl } from "@/lib/branding/assets";

export const metadata: Metadata = {
  title: "Bobkat Professional | Strategic IT for Growing Businesses",
  description:
    "Bobkat Professional provides strategic IT leadership, enterprise-inspired cybersecurity, centralized management, and proactive technology planning for growing organizations.",
  alternates: {
    canonical: "/solutions/professional",
  },
  openGraph: {
    title: "Bobkat Professional | Strategic IT for Growing Businesses",
    description:
      "Strategic IT leadership, enterprise-inspired cybersecurity, centralized management, and proactive technology planning for growing organizations.",
    url: "/solutions/professional",
    type: "website",
    images: [
      {
        url: publicAssetUrl("/solutions/professional/Professional Banner Image.png"),
        width: 1280,
        height: 640,
        alt: "Bobkat Professional strategic technology solution for growing businesses",
      },
    ],
  },
};

export default function ProfessionalSolutionPage() {
  return <ProfessionalLanding />;
}
