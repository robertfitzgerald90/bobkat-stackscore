import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicMarketingNav } from "@/components/public/public-marketing-nav";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { TechnologySnapshotWizard } from "@/components/technology-snapshot/technology-snapshot-wizard";
import { BRAND } from "@/lib/branding";
import { MARKETING_SECTION_COMPACT } from "@/lib/marketing/tokens";

export const metadata: Metadata = {
  title: `Technology Snapshot | ${BRAND.companyName}`,
  description:
    "Take a quick technology health snapshot across eight pillars and get immediate guidance from Bobkat IT.",
};

export default function TechnologySnapshotPage() {
  return (
    <PublicPageShell>
      <PublicMarketingNav active="assessment" />
      <main className={MARKETING_SECTION_COMPACT}>
        <div className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-2xl flex-col justify-center sm:min-h-[calc(100dvh-5rem)]">
          <Suspense
            fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}
          >
            <TechnologySnapshotWizard />
          </Suspense>
        </div>
      </main>
    </PublicPageShell>
  );
}
