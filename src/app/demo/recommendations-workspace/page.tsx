import type { Metadata } from "next";
import { RecommendationsWorkspaceDemo } from "@/components/marketing-demo";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { BRAND } from "@/lib/branding";

const title = "Recommendations Workspace Demo | StackScore";
const description =
  "Public client-experience preview of StackScore Recommendations — prioritized improvement opportunities with business context. Demo data only.";

export const metadata: Metadata = {
  title,
  description,
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/demo/recommendations-workspace",
  },
  openGraph: {
    title,
    description,
    url: "/demo/recommendations-workspace",
    type: "website",
    siteName: BRAND.productName,
  },
};

export default function RecommendationsWorkspaceDemoPage() {
  return (
    <PublicPageShell contentClassName="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 rounded-lg border border-border/70 bg-card/60 px-4 py-3 text-sm text-muted-foreground">
        Public demo using sanitized sample data for {BRAND.productName}. No client records,
        authentication, or billing data are loaded.
      </div>
      <RecommendationsWorkspaceDemo screenshotFrame />
    </PublicPageShell>
  );
}
