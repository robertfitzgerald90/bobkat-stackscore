import type { Metadata } from "next";
import { Suspense } from "react";
import { TechnologySnapshotWizard } from "@/components/technology-snapshot/technology-snapshot-wizard";
import { BRAND } from "@/lib/branding";

export const metadata: Metadata = {
  title: `Technology Snapshot | ${BRAND.companyName}`,
  description:
    "Take a quick technology health snapshot across eight pillars and get immediate guidance from Bobkat IT.",
};

export default function TechnologySnapshotPage() {
  return (
    <main className="min-h-screen bg-muted/30">
      <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
        <TechnologySnapshotWizard />
      </Suspense>
    </main>
  );
}
