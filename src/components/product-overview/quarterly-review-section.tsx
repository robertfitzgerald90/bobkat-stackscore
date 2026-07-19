"use client";

import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProductOverview } from "@/components/product-overview/product-overview-context";
import { trackProductOverviewQbrPreviewed } from "@/lib/analytics/product-overview-events";
import { BUSINESS_REVIEW_LABEL, BUSINESS_REVIEW_TAGLINE } from "@/lib/customer-deliverable-labels";
import { getStrategicConsultingMonthlyLabel } from "@/lib/product-overview/interactive-demo";

export function QuarterlyReviewSection() {
  const { demoProfile, openDetail } = useProductOverview();
  const review = demoProfile.dashboard.quarterlyReview;

  const metrics = [
    ["Current Technology Score", String(review.currentScore)],
    ["Previous Review", String(review.previousScore)],
    ["Improvement Since Last Review", `+${review.scoreChange}`],
    ["Projects Completed", String(review.projectsCompleted)],
    ["Recommendations Closed", String(review.recommendationsClosed)],
    ["Open High Priority", String(review.openHighPriority)],
    ["Execution Plan Completion", `${review.roadmapCompletionPercent}%`],
    ["Budget Utilization", `${review.budgetUtilizationPercent}%`],
  ] as const;

  return (
    <section
      id="product-overview-quarterly-review"
      className="scroll-mt-[var(--demo-shell-height,9rem)] border-t border-border/70 bg-muted/10 px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <OfferReveal>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              {BUSINESS_REVIEW_LABEL}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {BUSINESS_REVIEW_TAGLINE}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              StackScore business reviews give leadership a clear picture of score movement,
              completed work, open risks, and upcoming priorities — whenever they provide value.
            </p>
          </div>
        </OfferReveal>

        <OfferReveal delayMs={80}>
          <Card className="mt-8 border-border/70 shadow-sm">
            <CardContent className="space-y-6 p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Next Business Review</p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">{review.nextReviewDate}</p>
                </div>
                <Badge variant="outline">{review.status}</Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p
                      className={`mt-1 text-xl font-semibold ${
                        label === "Improvement Since Last Review" ? "text-success" : "text-foreground"
                      }`}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                className="h-11 px-8"
                data-demo-feature="executiveReview"
                onClick={(event) => {
                  trackProductOverviewQbrPreviewed();
                  openDetail({ type: "executiveReview" }, event.currentTarget);
                }}
              >
                Preview Executive Review
              </Button>
            </CardContent>
          </Card>
        </OfferReveal>

        <OfferReveal delayMs={120}>
          <Card className="mt-6 border-primary/20 bg-primary/5 shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                Ongoing Strategic Guidance
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                Living Execution Plan Reviews · Business Reviews · Lifecycle Planning · Budget
                Forecasting · Risk Monitoring
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Strategic IT Consulting keeps the living execution plan accountable after Phase 1 —
                starting at {getStrategicConsultingMonthlyLabel()} from the production consulting
                price.
              </p>
            </CardContent>
          </Card>
        </OfferReveal>
      </div>
    </section>
  );
}
