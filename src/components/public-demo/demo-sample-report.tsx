import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  ClientPageHeader,
  ClientPageShell,
  ClientSectionHeader,
} from "@/components/client-ui";
import { buttonClassName } from "@/components/ui/button";
import { CLIENT_SURFACE_CARD_INDUSTRIAL } from "@/lib/client-ui/tokens";
import { formatMaturityScore } from "@/lib/scoring/score-display";
import {
  PUBLIC_DEMO_COMPANY_NAME,
  PUBLIC_DEMO_SAMPLE_NOTICE,
} from "@/lib/public-demo/constants";
import { getPublicDemoOverview } from "@/lib/public-demo/provider";
import { PUBLIC_DEMO_REPORTS_PATH } from "@/lib/public-demo/routes";
import { cn } from "@/lib/utils";

/**
 * SS-WEB-003 — Labeled on-screen sample report preview (no PDF engine rebuild).
 */
export function DemoSampleReport() {
  const overview = getPublicDemoOverview();

  return (
    <ClientPageShell className="max-w-3xl space-y-8">
      <ClientPageHeader
        eyebrow="Sample report preview"
        title="Technology Maturity Assessment"
        description="On-screen preview only. This is not a downloadable PDF and contains no real customer data."
        actions={
          <Link
            href={PUBLIC_DEMO_REPORTS_PATH}
            className={buttonClassName({ variant: "outline", size: "sm" })}
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Back to Reports
          </Link>
        }
      />

      <p
        className="rounded-sm border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-muted-foreground"
        role="status"
      >
        {PUBLIC_DEMO_SAMPLE_NOTICE}
      </p>

      <section
        className={cn(CLIENT_SURFACE_CARD_INDUSTRIAL, "space-y-6 p-5 sm:p-6")}
        aria-label="Sample assessment summary"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Organization
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {PUBLIC_DEMO_COMPANY_NAME}
            <span className="ml-2 text-sm font-normal text-muted-foreground">(sample)</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Assessed {overview.assessedAtLabel}
          </p>
        </div>

        <div>
          <ClientSectionHeader title="Official StackScore" />
          <p className="mt-2 font-mono text-4xl font-semibold tabular-nums text-foreground">
            {formatMaturityScore(overview.stackScore)}
            <span className="ml-2 text-base font-normal text-muted-foreground">/ 100</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{overview.maturityLabel} maturity</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            {overview.maturityExplanation}
          </p>
        </div>

        <div>
          <ClientSectionHeader title="Pillar scores" />
          <ul className="mt-3 divide-y divide-border/60 rounded-sm border border-border">
            {overview.pillars.map((pillar) => (
              <li
                key={pillar.code}
                className="flex items-center justify-between gap-3 bg-card px-3 py-2.5 text-sm"
              >
                <span className="text-foreground">{pillar.name}</span>
                <span className="font-mono tabular-nums text-foreground">
                  {formatMaturityScore(pillar.score)}
                  <span className="ml-2 text-muted-foreground">{pillar.maturityLabel}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </ClientPageShell>
  );
}
