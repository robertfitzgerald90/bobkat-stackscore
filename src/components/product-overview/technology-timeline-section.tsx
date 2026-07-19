"use client";

import { useEffect, useState } from "react";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useProductOverview } from "@/components/product-overview/product-overview-context";
import { trackProductOverviewSectionViewed, trackProductOverviewTimelineInteraction } from "@/lib/analytics/product-overview-events";
import { formatDemoCurrency } from "@/lib/product-overview/demo-dashboard";
import type { DemoTimelineSnapshot } from "@/lib/product-overview/types";
import { cn } from "@/lib/utils";

function TimelineDashboardPreview({ snapshot }: { snapshot: DemoTimelineSnapshot }) {
  const { metrics } = snapshot;

  return (
    <Card className="border-border/70 shadow-sm transition-all duration-500">
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">{snapshot.label}</p>
            <p className="text-xs text-muted-foreground">{snapshot.period}</p>
          </div>
          <Badge variant="outline">{metrics.maturityLabel}</Badge>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">{snapshot.summary}</p>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Technology Score", `${metrics.technologyScore} / 100`],
            ["Open Recommendations", String(metrics.openRecommendations)],
            ["Active Projects", String(metrics.activeProjects)],
            ["Roadmap Completion", `${metrics.roadmapCompletionPercent}%`],
            ["High Priority", String(metrics.highPriorityRecommendations)],
            ["Annual Plan", formatDemoCurrency(metrics.annualTechnologyPlan)],
            ["Approved Spend", formatDemoCurrency(metrics.approvedSpend)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-muted/30 p-3 transition-all duration-500">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TechnologyTimelineSection() {
  const { demoProfile } = useProductOverview();
  const snapshots = demoProfile.timelineSnapshots;
  const [activeIndex, setActiveIndex] = useState(snapshots.length - 1);
  const snapshot = snapshots[activeIndex]!;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) trackProductOverviewSectionViewed("product-overview-timeline");
      },
      { threshold: 0.25 },
    );
    const element = document.getElementById("product-overview-timeline");
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="product-overview-timeline"
      className="scroll-mt-[var(--demo-shell-height,9rem)] border-t border-border/70 bg-muted/10 px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <OfferReveal>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Technology Timeline
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Watch technology maturity evolve over time
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Drag or click through Northstar Manufacturing&apos;s ongoing partnership journey — from
              first assessment to managed technology strategy.
            </p>
          </div>
        </OfferReveal>

        <div className="mt-8">
          <label htmlFor="technology-timeline-slider" className="sr-only">
            Technology timeline progress
          </label>
          <input
            id="technology-timeline-slider"
            type="range"
            min={0}
            max={snapshots.length - 1}
            value={activeIndex}
            onChange={(event) => {
              const index = Number(event.target.value);
              setActiveIndex(index);
              trackProductOverviewTimelineInteraction(snapshots[index]!.id);
            }}
            className="w-full accent-primary"
          />
        </div>

        <div className="mt-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max gap-2">
            {snapshots.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveIndex(index);
                  trackProductOverviewTimelineInteraction(item.id);
                }}
                aria-pressed={index === activeIndex}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-all sm:text-sm",
                  index === activeIndex
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background text-foreground hover:bg-muted",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <OfferReveal delayMs={80}>
          <div className="mt-8">
            <TimelineDashboardPreview snapshot={snapshot} />
          </div>
        </OfferReveal>
      </div>
    </section>
  );
}
