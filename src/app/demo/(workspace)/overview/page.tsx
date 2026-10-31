import { CustomerExecutiveDashboard } from "@/components/customer-portal/customer-executive-dashboard";
import { buildSocialPageMetadata } from "@/lib/branding/social-og";
import {
  PUBLIC_DEMO_RECOMMENDATIONS_HREF,
  getPublicDemoWorkspaceLinks,
} from "@/lib/public-demo/presentation";
import { getPublicDemoOverview } from "@/lib/public-demo/provider";

/**
 * `/demo` redirects here — share crawlers often use the final URL.
 * Keep OG/Twitter aligned with `/demo` and canonical at `/demo`.
 */
export const metadata = {
  ...buildSocialPageMetadata({
    title: "StackScore Demo | See Technology Intelligence in Action",
    description:
      "Explore an interactive technology maturity assessment dashboard. See how StackScore identifies risks and prioritizes improvements.",
    path: "/demo",
    image: "stackscoreDemo",
  }),
  robots: { index: true, follow: true },
};

/**
 * SS-WEB-003-R1 — Mounts the shared customer Overview composition.
 */
export default function PublicDemoOverviewPage() {
  const overview = getPublicDemoOverview();
  return (
    <CustomerExecutiveDashboard
      overview={overview}
      workspaceLinks={getPublicDemoWorkspaceLinks()}
      recommendationsHref={PUBLIC_DEMO_RECOMMENDATIONS_HREF}
      showBookingCta={false}
    />
  );
}
