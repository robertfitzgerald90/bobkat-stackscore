import { redirect } from "next/navigation";
import { buildSocialPageMetadata } from "@/lib/branding/social-og";
import { PUBLIC_DEMO_OVERVIEW_PATH } from "@/lib/public-demo/routes";

/**
 * Metadata for `/demo` before the Overview redirect.
 * Crawlers that follow the redirect also need matching fields on `/demo/overview`.
 */
export const metadata = {
  ...buildSocialPageMetadata({
    title: "StackScore Demo | See Technology Intelligence in Action",
    description:
      "Explore an interactive technology maturity assessment dashboard. See how StackScore identifies risks and prioritizes improvements.",
    path: "/demo",
    image: "stackscoreDemo",
  }),
  keywords: [
    "StackScore",
    "StackScore Demo",
    "technology maturity assessment",
    "customer portal demo",
    "Bobkat IT",
  ],
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
