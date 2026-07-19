"use client";

import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProductOverview } from "@/components/product-overview/product-overview-context";
import { trackProductOverviewRecommendationOpened } from "@/lib/analytics/product-overview-events";
import type { DemoRecommendation, RecommendationFilterTag } from "@/lib/product-overview/types";
import { cn } from "@/lib/utils";

const FILTERS: { id: RecommendationFilterTag; label: string }[] = [
  { id: "all", label: "All" },
  { id: "critical", label: "Critical" },
  { id: "high", label: "High Priority" },
  { id: "quick-win", label: "Quick Wins" },
  { id: "planned", label: "Planned" },
  { id: "completed", label: "Completed" },
];

function filterRecommendations(
  recommendations: DemoRecommendation[],
  filter: RecommendationFilterTag,
) {
  if (filter === "all") return recommendations;
  if (filter === "high") {
    return recommendations.filter(
      (rec) => rec.priority === "High" || rec.priority === "Critical",
    );
  }
  return recommendations.filter((rec) => rec.filterTags.includes(filter));
}

function priorityVariant(priority: DemoRecommendation["priority"]) {
  if (priority === "Critical") return "destructive" as const;
  if (priority === "High") return "default" as const;
  return "outline" as const;
}

export function RecommendationsWorkspaceSection() {
  const [activeFilter, setActiveFilter] = useState<RecommendationFilterTag>("all");
  const { demoProfile, openConnectedRecommendation, isHighlighted } = useProductOverview();

  const filteredRecommendations = useMemo(
    () => filterRecommendations(demoProfile.recommendations, activeFilter),
    [activeFilter, demoProfile.recommendations],
  );

  return (
    <section
      id="product-overview-recommendations"
      className="scroll-mt-36 border-t border-border/70 bg-background px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <OfferReveal>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Recommendations
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Prioritized improvements with business context
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Every recommendation connects assessment findings to business impact, estimated
              investment, and roadmap timing — not just a list of technical tasks.
            </p>
          </div>
        </OfferReveal>

        <div
          className="mt-8 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter recommendations"
        >
          {FILTERS.map((filter) => (
            <Button
              key={filter.id}
              type="button"
              size="sm"
              variant={activeFilter === filter.id ? "default" : "outline"}
              onClick={() => setActiveFilter(filter.id)}
              aria-pressed={activeFilter === filter.id}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredRecommendations.map((recommendation, index) => {
            const highlighted = isHighlighted({ recommendationId: recommendation.id });
            return (
              <OfferReveal key={recommendation.id} delayMs={index * 50}>
                <button
                  type="button"
                  onClick={() => {
                    trackProductOverviewRecommendationOpened(recommendation.id);
                    openConnectedRecommendation(recommendation.id, "recommendations_workspace");
                  }}
                  className={cn(
                    "w-full rounded-xl border border-border/70 bg-card p-5 text-left transition-all hover:border-primary/30 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    highlighted && "ring-2 ring-primary ring-offset-2",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={priorityVariant(recommendation.priority)}>
                          {recommendation.priority}
                        </Badge>
                        <Badge variant="outline">{recommendation.pillarName}</Badge>
                      </div>
                      <h3 className="mt-3 text-base font-semibold text-foreground">
                        {recommendation.title}
                      </h3>
                    </div>
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {recommendation.businessImpact}
                  </p>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground">Estimated cost</dt>
                      <dd className="mt-1 font-medium">{recommendation.estimatedCost}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Effort</dt>
                      <dd className="mt-1 font-medium">{recommendation.effort}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-xs text-muted-foreground">Target quarter</dt>
                      <dd className="mt-1 font-medium">{recommendation.target}</dd>
                    </div>
                  </dl>
                </button>
              </OfferReveal>
            );
          })}
        </div>

        {filteredRecommendations.length === 0 ? (
          <Card className="mt-6 border-border/70">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No recommendations match this filter in the demo workspace.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </section>
  );
}
