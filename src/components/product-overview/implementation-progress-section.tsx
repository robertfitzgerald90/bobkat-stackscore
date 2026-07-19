"use client";

import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { RoadmapStatusBadge } from "@/components/client-roadmap/roadmap-status-badge";
import { useInteractiveDemo } from "@/components/product-overview/interactive-demo-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RECOMMENDATION_LIFECYCLE_LABELS } from "@/lib/client-roadmap/labels";
import { scrollToSection } from "@/lib/product-overview/polish-classes";
import { cn } from "@/lib/utils";

function formatDemoDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function ImplementationProgressSection() {
  const { view, state, startImplementation, completePhase1 } = useInteractiveDemo();
  const { phase1, stage, canStartImplementation, canSimulateCompletion } = view;
  const locked = stage === "phase1_awaiting_approval";

  return (
    <section
      id="product-overview-implementation"
      className="scroll-mt-[var(--demo-shell-height,9rem)] border-t border-border/70 bg-muted/10 px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <OfferReveal>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Implementation Progress
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Watch Phase 1 move from approval to delivery
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              StackScore is a guided improvement platform — not a static report. Approved phases
              become living implementation work with clear outcomes.
            </p>
          </div>
        </OfferReveal>

        <OfferReveal delayMs={80}>
          <Card
            className={cn(
              "mt-8 border-border/70 shadow-sm",
              locked && "opacity-80",
            )}
          >
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <RoadmapStatusBadge status={phase1.status} />
                <Badge variant="outline">{phase1.completionPercent}% complete</Badge>
              </div>
              <CardTitle className="mt-2 text-2xl">
                Phase {phase1.phaseNumber} — {phase1.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Start date: {formatDemoDate(state.implementationStartedAt)} · Target completion:{" "}
                {formatDemoDate(state.implementationTargetAt)}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {locked ? (
                <div className="rounded-xl border border-border/70 bg-background px-4 py-3 text-sm text-muted-foreground">
                  Approve Phase 1 in the proposal preview to unlock the implementation workspace.
                </div>
              ) : null}

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Overall phase completion</span>
                  <span className="font-semibold tabular-nums">{phase1.completionPercent}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-500 motion-reduce:transition-none"
                    style={{ width: `${phase1.completionPercent}%` }}
                  />
                </div>
              </div>

              <div className="grid gap-3">
                {phase1.initiatives.map((initiative) => (
                  <div
                    key={initiative.id}
                    className="flex flex-col gap-2 rounded-xl border border-border/70 bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground">{initiative.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {initiative.businessBenefit}
                      </p>
                    </div>
                    <Badge
                      variant={initiative.status === "completed" ? "default" : "outline"}
                      className="w-fit"
                    >
                      {RECOMMENDATION_LIFECYCLE_LABELS[initiative.status]}
                    </Badge>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Business outcomes being enabled
                </h3>
                <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                  {phase1.businessOutcomes.map((outcome) => (
                    <li
                      key={outcome}
                      className="rounded-lg border border-border/60 px-3 py-2 text-sm text-muted-foreground"
                    >
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {canStartImplementation && stage === "phase1_approved" ? (
                  <Button
                    type="button"
                    className="h-11 px-6"
                    onClick={startImplementation}
                  >
                    Start Implementation in Demo
                  </Button>
                ) : null}
                {canSimulateCompletion ? (
                  <Button
                    type="button"
                    className="h-11 px-6"
                    onClick={() => {
                      completePhase1();
                      scrollToSection("product-overview-measurable-improvement");
                    }}
                  >
                    Simulate Phase Completion
                  </Button>
                ) : null}
                {stage === "phase1_completed" ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 px-6"
                    onClick={() => scrollToSection("product-overview-measurable-improvement")}
                  >
                    View Measurable Improvement
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </OfferReveal>
      </div>
    </section>
  );
}
