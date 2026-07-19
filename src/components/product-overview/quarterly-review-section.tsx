"use client";

import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProductOverview } from "@/components/product-overview/product-overview-context";
import { trackProductOverviewQbrPreviewed } from "@/lib/analytics/product-overview-events";
import { northstarDemoDashboard } from "@/lib/product-overview/demo-dashboard";

export function QuarterlyReviewSection() {
  const { openDetail } = useProductOverview();
  const review = northstarDemoDashboard.quarterlyReview;

  const metrics = [
    ["Current Technology Score", String(review.currentScore)],
    ["Previous Quarter", String(review.previousScore)],
    ["Improvement", `+${review.scoreChange}`],
    ["Projects Completed", String(review.projectsCompleted)],
    ["Recommendations Closed", String(review.recommendationsClosed)],
    ["Open High Priority", String(review.openHighPriority)],
    ["Roadmap Completion", `${review.roadmapCompletionPercent}%`],
    ["Budget Utilization", `${review.budgetUtilizationPercent}%`],
  ] as const;

  return (
    <section
      id="product-overview-quarterly-review"
      className="scroll-mt-36 border-t border-border/70 bg-muted/10 px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <OfferReveal>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Quarterly Technology Review
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Executive accountability, every quarter
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              StackScore quarterly reviews give leadership a clear picture of score movement,
              completed work, open risks, and next-quarter priorities.
            </p>
          </div>
        </OfferReveal>

        <OfferReveal delayMs={80}>
          <Card className="mt-8 border-border/70 shadow-sm">
            <CardContent className="space-y-6 p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Next Quarterly Review</p>
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
                        label === "Improvement" ? "text-success" : "text-foreground"
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
                onClick={() => {
                  trackProductOverviewQbrPreviewed();
                  openDetail({ type: "executiveReview" });
                }}
              >
                Preview Executive Review
              </Button>
            </CardContent>
          </Card>
        </OfferReveal>
      </div>
    </section>
  );
}
