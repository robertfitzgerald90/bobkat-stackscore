"use client";

import { ChevronRight, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProductOverview } from "@/components/product-overview/product-overview-context";
import { trackProductOverviewPillarOpened } from "@/lib/analytics/product-overview-events";
import { northstarDemoDashboard } from "@/lib/product-overview/demo-dashboard";
import type { DemoPillar, PillarStatusColor } from "@/lib/product-overview/types";
import { cn } from "@/lib/utils";

function statusColorClasses(color: PillarStatusColor) {
  switch (color) {
    case "success":
      return "border-success/30 bg-success/5";
    case "warning":
      return "border-warning/30 bg-warning/5";
    case "critical":
      return "border-destructive/30 bg-destructive/5";
    default:
      return "border-border/70 bg-background";
  }
}

function TrendIndicator({ pillar }: { pillar: DemoPillar }) {
  if (pillar.trend === "up") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
        <TrendingUp className="h-3.5 w-3.5" aria-hidden />+{pillar.trendDelta}
      </span>
    );
  }
  if (pillar.trend === "down") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
        <TrendingDown className="h-3.5 w-3.5" aria-hidden />
        {pillar.trendDelta}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
      <Minus className="h-3.5 w-3.5" aria-hidden />
      Stable
    </span>
  );
}

export function AssessmentSection() {
  const { openConnectedPillar, isHighlighted } = useProductOverview();
  const { technologyScore, pillars } = northstarDemoDashboard;

  return (
    <section
      id="product-overview-assessment"
      className="scroll-mt-36 border-t border-border/70 bg-background px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <OfferReveal>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Technology Maturity Assessment
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Executive assessment summary
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Northstar Manufacturing&apos;s assessment establishes a measurable baseline across
              eight strategic pillars — with clear maturity labels, trends, and improvement targets.
            </p>
          </div>
        </OfferReveal>

        <OfferReveal delayMs={80}>
          <Card className="mt-8 border-border/70 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Overall Technology Score</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-end gap-6">
              <div>
                <p className="text-5xl font-semibold tabular-nums text-foreground">
                  {technologyScore.score}
                  <span className="text-2xl text-muted-foreground"> / {technologyScore.maxScore}</span>
                </p>
                <Badge variant="outline" className="mt-3">
                  {technologyScore.maturityLabel}
                </Badge>
              </div>
              <div className="rounded-lg bg-muted/30 px-4 py-3">
                <p className="text-xs text-muted-foreground">Change since last review</p>
                <p className="mt-1 text-xl font-semibold text-success">
                  +{technologyScore.changeSinceLastReview} points
                </p>
              </div>
              <div className="rounded-lg bg-muted/30 px-4 py-3">
                <p className="text-xs text-muted-foreground">Projected target</p>
                <p className="mt-1 text-xl font-semibold text-foreground">
                  {technologyScore.projectedScore} / {technologyScore.maxScore}
                </p>
              </div>
            </CardContent>
          </Card>
        </OfferReveal>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {pillars.map((pillar, index) => {
            const highlighted = isHighlighted({ pillarId: pillar.id });
            return (
              <OfferReveal key={pillar.id} delayMs={index * 40}>
                <button
                  type="button"
                  onClick={() => {
                    trackProductOverviewPillarOpened(pillar.id, "assessment");
                    openConnectedPillar(pillar.id, "assessment_pillar");
                  }}
                  aria-label={`Open ${pillar.name} assessment details`}
                  className={cn(
                    "w-full rounded-xl border p-4 text-left transition-all hover:border-primary/30 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    statusColorClasses(pillar.statusColor),
                    highlighted && "ring-2 ring-primary ring-offset-2",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{pillar.name}</p>
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  </div>
                  <div className="mt-3 flex items-end justify-between gap-2">
                    <p className="text-3xl font-semibold tabular-nums">{pillar.score}</p>
                    <TrendIndicator pillar={pillar} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{pillar.maturityLabel}</Badge>
                    <Badge
                      variant={
                        pillar.priorityLevel === "Critical"
                          ? "destructive"
                          : pillar.priorityLevel === "High"
                            ? "default"
                            : "outline"
                      }
                    >
                      {pillar.priorityLevel}
                    </Badge>
                  </div>
                </button>
              </OfferReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
