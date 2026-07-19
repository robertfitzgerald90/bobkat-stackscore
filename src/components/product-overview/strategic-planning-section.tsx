"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProductOverview } from "@/components/product-overview/product-overview-context";
import { trackProductOverviewPlanningViewed } from "@/lib/analytics/product-overview-events";
import { STRATEGIC_PLANNING_TABS } from "@/lib/product-overview/demo-partnership";
import type { DemoStrategicPlanningTab } from "@/lib/product-overview/types";

export function StrategicPlanningSection() {
  const [activeTabId, setActiveTabId] = useState<DemoStrategicPlanningTab["id"]>("next-quarter");
  const { openDetail } = useProductOverview();
  const activeTab =
    STRATEGIC_PLANNING_TABS.find((tab) => tab.id === activeTabId) ?? STRATEGIC_PLANNING_TABS[0]!;

  useEffect(() => {
    trackProductOverviewPlanningViewed(activeTabId);
  }, [activeTabId]);

  return (
    <section
      id="product-overview-strategic-planning"
      className="scroll-mt-36 border-t border-border/70 bg-background px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <OfferReveal>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Strategic Planning
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Plan beyond the next project
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Move from quarter-to-quarter firefighting to disciplined next-quarter, 12-month, and
              three-year technology planning.
            </p>
          </div>
        </OfferReveal>

        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Planning horizon">
          {STRATEGIC_PLANNING_TABS.map((tab) => (
            <Button
              key={tab.id}
              type="button"
              size="sm"
              variant={activeTabId === tab.id ? "default" : "outline"}
              onClick={() => setActiveTabId(tab.id)}
              aria-pressed={activeTabId === tab.id}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {activeTab.initiatives.map((initiative, index) => (
            <OfferReveal key={initiative.id} delayMs={index * 40}>
              <button
                type="button"
                data-demo-feature={`strategicInitiative:${initiative.id}`}
                onClick={(event) =>
                  openDetail(
                    { type: "strategicInitiative", initiativeId: initiative.id },
                    event.currentTarget,
                  )
                }
                className="w-full rounded-xl border border-border/70 bg-card p-5 text-left transition-all hover:border-primary/30 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={initiative.priority === "Critical" ? "destructive" : "outline"}>
                        {initiative.priority}
                      </Badge>
                      <Badge variant="outline">{initiative.timeframe}</Badge>
                    </div>
                    <h3 className="mt-3 text-base font-semibold text-foreground">{initiative.title}</h3>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{initiative.summary}</p>
              </button>
            </OfferReveal>
          ))}
        </div>

        <Card className="mt-6 border-border/70 bg-muted/20 shadow-sm">
          <CardContent className="p-5 text-sm text-muted-foreground">
            Planning horizons include cloud modernization, lifecycle planning, network refresh,
            business continuity, security improvements, vendor strategy, technology standards, and
            budget forecasting.
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
