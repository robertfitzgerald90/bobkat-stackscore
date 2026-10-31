import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicMarketingNav } from "@/components/public/public-marketing-nav";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { TechnologySnapshotWizard } from "@/components/technology-snapshot/technology-snapshot-wizard";
import { BRAND } from "@/lib/branding";

export const metadata: Metadata = {
  title: `Free Technology Snapshot | ${BRAND.companyName}`,
  description:
    "Get an indicative technology posture in about five minutes — no account required. See how your organization differs from a full StackScore assessment.",
};

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
