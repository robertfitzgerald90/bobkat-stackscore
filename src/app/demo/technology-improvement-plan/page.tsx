import type { Metadata } from "next";
import { Suspense } from "react";
import { TipDemoPageClient } from "@/app/demo/technology-improvement-plan/tip-demo-page-client";
import { isTipDemoStage, type TipDemoStage } from "@/components/marketing-demo";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { BRAND } from "@/lib/branding";

const title = "Technology Improvement Plan Demo | StackScore";
const description =
  "Public client-experience preview of the StackScore Technology Improvement Plan — maturity profile, recommendations, playbooks, roadmap, and executive report. Demo data only.";

export const metadata: Metadata = {
  title,
  description,
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/demo/technology-improvement-plan",
  },
  openGraph: {
    title,
    description,
    url: "/demo/technology-improvement-plan",
    type: "website",
    siteName: BRAND.productName,
  },
};

type PageProps = {
  searchParams: Promise<{ stage?: string | string[] }>;
};

function resolveStage(value: string | string[] | undefined): TipDemoStage {
  const raw = Array.isArray(value) ? value[0] : value;
  return isTipDemoStage(raw) ? raw : "maturity-profile";
}

export default async function TechnologyImprovementPlanDemoPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const initialStage = resolveStage(params.stage);

  return (
    <PublicPageShell contentClassName="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 rounded-lg border border-border/70 bg-card/60 px-4 py-3 text-sm text-muted-foreground">
        Public demo using sanitized sample data for {BRAND.productName}. No client records,
        authentication, or billing data are loaded.
      </div>
      <Suspense
        fallback={
          <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
            Loading Technology Improvement Plan demo…
          </div>
        }
      >
        <TipDemoPageClient initialStage={initialStage} />
      </Suspense>
    </PublicPageShell>
  );
}
