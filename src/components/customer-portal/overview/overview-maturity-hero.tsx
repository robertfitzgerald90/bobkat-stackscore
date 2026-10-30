import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ClientStatusBadge } from "@/components/client-ui";
import { buttonClassName } from "@/components/ui/button";
import { CLIENT_METRIC_VALUE, CLIENT_SURFACE_CARD_INDUSTRIAL } from "@/lib/client-ui/tokens";
import { CUSTOMER_TERM_STACKSCORE } from "@/lib/assessments/customer-reporting";
import { formatMaturityScore, getScoreTextColorClass } from "@/lib/scoring/score-display";
import type { CustomerOverviewDto } from "@/lib/customer-portal/overview";
import { cn } from "@/lib/utils";

type OverviewMaturityHeroProps = {
  overview: CustomerOverviewDto;
};

export function OverviewMaturityHero({ overview }: OverviewMaturityHeroProps) {
  const {
    companyName,
    welcomeName,
    stackScore,
    maturityLabel,
    maturityExplanation,
    assessedAtLabel,
    nextAction,
    reportHref,
  } = overview;

  return (
    <section
      className={cn(
        CLIENT_SURFACE_CARD_INDUSTRIAL,
        "brand-level-1 brand-frame overflow-hidden p-6 sm:p-8",
      )}
      aria-labelledby="overview-maturity-heading"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end">
        <div className="min-w-0 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            {CUSTOMER_TERM_STACKSCORE} Overview
          </p>
          <div>
            <p className="text-sm text-muted-foreground">{companyName}</p>
            <h1
              id="overview-maturity-heading"
              className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              Welcome back, {welcomeName}.
            </h1>
          </div>
          {maturityExplanation ? (
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
              {maturityExplanation}
            </p>
          ) : (
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
              Complete an assessment to unlock your official StackScore and maturity profile.
            </p>
          )}
          {assessedAtLabel ? (
            <p className="text-sm text-muted-foreground">
              Latest completed assessment:{" "}
              <span className="font-medium text-foreground">{assessedAtLabel}</span>
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3 pt-1">
            {nextAction ? (
              <Link href={nextAction.href} className={buttonClassName({})}>
                {nextAction.label}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            ) : null}
            {reportHref ? (
              <Link href={reportHref} className={buttonClassName({ variant: "outline" })}>
                View assessment report
              </Link>
            ) : null}
          </div>
        </div>

        <div className="rounded-sm border border-border/80 bg-muted/20 p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Official {CUSTOMER_TERM_STACKSCORE}
          </p>
          <p
            className={cn(
              "mt-3 text-5xl font-semibold sm:text-6xl",
              CLIENT_METRIC_VALUE,
              stackScore !== null ? getScoreTextColorClass(stackScore) : "text-foreground",
            )}
          >
            {formatMaturityScore(stackScore)}
            {stackScore !== null ? (
              <span className="text-2xl font-normal text-muted-foreground"> / 100</span>
            ) : null}
          </p>
          {maturityLabel ? (
            <div className="mt-4">
              <ClientStatusBadge tone={stackScore !== null && stackScore < 40 ? "warning" : "success"}>
                {maturityLabel}
              </ClientStatusBadge>
            </div>
          ) : null}
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            DOC-119 maturity classification from your latest completed assessment. Official score
            updates only after reassessment.
          </p>
        </div>
      </div>
    </section>
  );
}
