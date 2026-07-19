"use client";

import { useEffect } from "react";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { Badge } from "@/components/ui/badge";
import { useProductOverview } from "@/components/product-overview/product-overview-context";
import { trackProductOverviewExecutiveDashboardViewed } from "@/lib/analytics/product-overview-events";
import { EXECUTIVE_DECISION_WIDGETS } from "@/lib/product-overview/demo-partnership";
import type { DemoExecutiveWidget } from "@/lib/product-overview/types";
import { cn } from "@/lib/utils";

function statusBadgeVariant(status: DemoExecutiveWidget["status"]) {
  if (status === "healthy") return "default" as const;
  if (status === "critical") return "destructive" as const;
  if (status === "attention") return "outline" as const;
  return "secondary" as const;
}

export function ExecutiveDecisionCenterSection() {
  const { openDetail } = useProductOverview();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) trackProductOverviewExecutiveDashboardViewed();
      },
      { threshold: 0.25 },
    );
    const element = document.getElementById("product-overview-executive-decisions");
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="product-overview-executive-decisions"
      className="scroll-mt-36 border-t border-border/70 bg-muted/10 px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <OfferReveal>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Executive Decision Center
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Technology decisions with business context
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Executive widgets surface what leaders need to know — why it matters, what it means
              for the business, and what to do next.
            </p>
          </div>
        </OfferReveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {EXECUTIVE_DECISION_WIDGETS.map((widget, index) => (
            <OfferReveal key={widget.id} delayMs={index * 30}>
              <button
                type="button"
                data-demo-feature={`executiveWidget:${widget.id}`}
                onClick={(event) => {
                  trackProductOverviewExecutiveDashboardViewed(widget.id);
                  openDetail(
                    { type: "executiveWidget", widgetId: widget.id },
                    event.currentTarget,
                  );
                }}
                className={cn(
                  "w-full rounded-xl border border-border/70 bg-card p-5 text-left shadow-sm transition-all hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-muted-foreground">{widget.label}</p>
                  <Badge variant={statusBadgeVariant(widget.status)}>{widget.status}</Badge>
                </div>
                <p className="mt-3 text-2xl font-semibold text-foreground">{widget.value}</p>
              </button>
            </OfferReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
