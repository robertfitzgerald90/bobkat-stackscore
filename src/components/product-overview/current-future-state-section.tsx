"use client";

import { useState } from "react";
import { ArrowDown, CheckCircle2, CircleDashed } from "lucide-react";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CURRENT_ENVIRONMENT_ITEMS,
  FUTURE_STATE_ITEMS,
} from "@/lib/product-overview/demo-strategy";
import { cn } from "@/lib/utils";

export function CurrentFutureStateSection() {
  const [view, setView] = useState<"current" | "future">("current");
  const items = view === "current" ? CURRENT_ENVIRONMENT_ITEMS : FUTURE_STATE_ITEMS;

  return (
    <section
      id="product-overview-current-future"
      className="scroll-mt-36 border-t border-border/70 bg-muted/10 px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <OfferReveal>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Current vs Future State
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              See the transformation StackScore enables
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Compare where Northstar Manufacturing started with the measurable future state
              created by assessment, prioritization, and roadmap execution.
            </p>
          </div>
        </OfferReveal>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            type="button"
            variant={view === "current" ? "default" : "outline"}
            onClick={() => setView("current")}
            aria-pressed={view === "current"}
          >
            Current Environment
          </Button>
          <Button
            type="button"
            variant={view === "future" ? "default" : "outline"}
            onClick={() => setView("future")}
            aria-pressed={view === "future"}
          >
            Future State
          </Button>
        </div>

        <OfferReveal delayMs={100}>
          <Card className="mt-6 overflow-hidden border-border/70 shadow-sm">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-[1fr_auto_1fr]">
                <div
                  className={cn(
                    "p-6 transition-opacity duration-300 sm:p-8",
                    view === "current" ? "opacity-100" : "opacity-40",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <CircleDashed className="h-5 w-5 text-muted-foreground" aria-hidden />
                    <h3 className="text-lg font-semibold text-foreground">Current Environment</h3>
                  </div>
                  <ul className="mt-5 space-y-3">
                    {CURRENT_ENVIRONMENT_ITEMS.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-center border-y border-border/70 bg-muted/20 px-4 py-6 md:border-x md:border-y-0 md:py-0">
                  <ArrowDown className="h-6 w-6 text-primary md:rotate-[-90deg]" aria-hidden />
                </div>

                <div
                  className={cn(
                    "p-6 transition-opacity duration-300 sm:p-8",
                    view === "future" ? "opacity-100" : "opacity-40",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" aria-hidden />
                    <h3 className="text-lg font-semibold text-foreground">Future State</h3>
                  </div>
                  <ul className="mt-5 space-y-3">
                    {FUTURE_STATE_ITEMS.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="border-t border-border/70 bg-card p-6 sm:p-8">
                <p className="text-sm font-medium text-muted-foreground">
                  {view === "current" ? "Current Environment" : "Future State"}
                </p>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {items.map((item) => (
                    <li
                      key={item}
                      className="rounded-lg border border-border/70 bg-background px-4 py-3 text-sm text-foreground transition-transform duration-300"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </OfferReveal>
      </div>
    </section>
  );
}
