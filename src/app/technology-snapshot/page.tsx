import { Suspense } from "react";
import { PublicMarketingNav } from "@/components/public/public-marketing-nav";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { TechnologySnapshotWizard } from "@/components/technology-snapshot/technology-snapshot-wizard";
import { buildSocialPageMetadata } from "@/lib/branding/social-og";

export const metadata = buildSocialPageMetadata({
  title: "Free Technology Snapshot | Bobkat IT",
  description:
    "Discover your business's technology strengths, identify potential risks, and uncover opportunities for improvement. Free, 14 questions, no account required.",
  path: "/technology-snapshot",
  image: "snapshot",
});

export default function TechnologySnapshotPage() {
  return (
    <PublicPageShell className="funnel-instrument">
      <PublicMarketingNav active="assessment" />
      <main className="relative px-0 py-0 sm:py-0">
        <Suspense
          fallback={
            <div className="p-8 text-center text-muted-foreground">Loading Snapshot…</div>
          }
        >
          <TechnologySnapshotWizard />
        </Suspense>
      </main>
    </PublicPageShell>
  );
}
