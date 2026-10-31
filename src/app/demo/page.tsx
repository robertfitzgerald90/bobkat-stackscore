import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BRAND } from "@/lib/branding";
import { PUBLIC_DEMO_OVERVIEW_PATH } from "@/lib/public-demo/routes";

const title = "StackScore Interactive Demo";
const description =
  "Explore a sample StackScore customer workspace — Overview, Explore, Roadmap, Projects, and Reports — using fictional Northstar Manufacturing data. No login required.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "StackScore",
    "StackScore Interactive Demo",
    "technology maturity assessment",
    "customer portal demo",
    "Bobkat IT",
  ],
  alternates: {
    canonical: "/demo",
  },
  openGraph: {
    title,
    description,
    url: "/demo",
    type: "website",
    siteName: BRAND.productName,
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

/**
 * SS-WEB-003 — Public demo entry redirects into the customer-parity Overview.
 */
export default function InteractiveDemoPage() {
  redirect(PUBLIC_DEMO_OVERVIEW_PATH);
}
