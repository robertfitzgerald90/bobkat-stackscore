import type { Metadata } from "next";
import { ProductOverviewExperience } from "@/components/product-overview/product-overview-experience";

const title = "StackScore Product Overview | Strategic IT Consulting Platform";
const description =
  "Experience StackScore as an ongoing technology partnership — interactive assessments, recommendations, roadmaps, projects, quarterly reviews, executive reporting, and strategic planning in one platform.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "StackScore",
    "technology maturity assessment",
    "Strategic IT Consulting",
    "technology roadmap",
    "executive technology reporting",
    "vCIO platform",
    "technology strategy",
  ],
  alternates: {
    canonical: "/product-overview",
  },
  openGraph: {
    title,
    description,
    url: "/product-overview",
    type: "website",
    siteName: "StackScore",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ProductOverviewPage() {
  return <ProductOverviewExperience />;
}
