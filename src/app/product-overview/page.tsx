import type { Metadata } from "next";
import { ProductOverviewExperience } from "@/components/product-overview/product-overview-experience";

export const metadata: Metadata = {
  title: "StackScore Product Overview | Technology Strategy Platform",
  description:
    "Explore StackScore from a client's perspective and see how technology assessments, recommendations, roadmaps, projects, and executive reporting come together in one platform.",
  alternates: {
    canonical: "/product-overview",
  },
  openGraph: {
    title: "StackScore Product Overview | Technology Strategy Platform",
    description:
      "Explore StackScore from a client's perspective and see how technology assessments, recommendations, roadmaps, projects, and executive reporting come together in one platform.",
    url: "/product-overview",
    type: "website",
  },
};

export default function ProductOverviewPage() {
  return <ProductOverviewExperience />;
}
