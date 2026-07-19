"use client";

import { ChevronRight, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { useInteractiveDemo } from "@/components/product-overview/interactive-demo-context";
import { useProductOverview } from "@/components/product-overview/product-overview-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trackProductOverviewPillarOpened } from "@/lib/analytics/product-overview-events";
import { scrollToSection } from "@/lib/product-overview/polish-classes";
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
  const { demoProfile, openConnectedPillar, isHighlighted } = useProductOverview();
  const { view } = useInteractiveDemo();
  const { pillars } = demoProfile.dashboard;
  const { company, assessment } = view;

  return (
    <section
      id="product-overview-assessment"
      className="scroll-mt-36 border-t border-border/70 bg-background px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <OfferReveal>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Assessment Results
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {company.name}&apos;s technology baseline
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              StackScore converts assessment findings into an ordered implementation roadmap so the
              organization can address its highest-priority risks first.
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
                  {assessment.initialStackScore}
                  <span className="text-2xl text-muted-foreground"> / 100</span>
                </p>
                <Badge variant="outline" className="mt-3">
                  Developing
                </Badge>
              </div>
              <div className="rounded-lg bg-muted/30 px-4 py-3">
                <p className="text-xs text-muted-foreground">Available improvement</p>
                <p className="mt-1 text-xl font-semibold text-foreground">
                  +{assessment.availableImprovement} points
                </p>
              </div>
              <div className="rounded-lg bg-muted/30 px-4 py-3">
                <p className="text-xs text-muted-foreground">Recommended approach</p>
                <p className="mt-1 text-xl font-semibold text-foreground">
                  {assessment.phaseCount} independently approvable phases
                </p>
              </div>
              <div className="rounded-lg bg-muted/30 px-4 py-3">
                <p className="text-xs text-muted-foreground">Generated recommendations</p>
                <p className="mt-1 text-xl font-semibold text-foreground">
                  {assessment.recommendationCount}
                </p>
              </div>
            </CardContent>
          </Card>
        </OfferReveal>

        <OfferReveal delayMs={100}>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <Card className="border-border/70">
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-foreground">Strengths</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {assessment.strengths.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-border/70">
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-foreground">Priority gaps</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {assessment.priorityGaps.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-border/70">
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-foreground">Primary risks</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {assessment.primaryRisks.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </OfferReveal>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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

        <OfferReveal delayMs={160}>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              className="h-11 px-6"
              onClick={() => scrollToSection("product-overview-roadmap")}
            >
              View Technology Roadmap
            </Button>
          </div>
        </OfferReveal>
      </div>
    </section>
  );
}
