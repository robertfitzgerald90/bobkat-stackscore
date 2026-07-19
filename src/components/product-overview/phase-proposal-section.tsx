"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { RoadmapStatusBadge } from "@/components/client-roadmap/roadmap-status-badge";
import { DemoInvestmentSummary } from "@/components/product-overview/demo-investment-summary";
import { useInteractiveDemo } from "@/components/product-overview/interactive-demo-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PHASE_PROPOSAL_STATUS_LABELS } from "@/lib/phase-proposals/types";
import { scrollToSection } from "@/lib/product-overview/polish-classes";

export function PhaseProposalSection() {
  const { view, approvePhase1, startImplementation } = useInteractiveDemo();
  const { company, phase1, proposal, canApprovePhase1, canStartImplementation, stage } = view;
  const [justApproved, setJustApproved] = useState(false);

  const handleApprove = () => {
    approvePhase1();
    setJustApproved(true);
  };

  return (
    <section
      id="product-overview-phase-proposal"
      className="scroll-mt-36 border-t border-border/70 bg-background px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <OfferReveal>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Phase Proposal
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Preview the Phase 1 proposal
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Prospects approve the highest-priority phase independently. Future phases stay visible
              on the roadmap without appearing in this proposal&apos;s pricing.
            </p>
          </div>
        </OfferReveal>

        <OfferReveal delayMs={80}>
          <Card className="mt-8 border-border/70 shadow-sm">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{proposal.proposalNumber}</Badge>
                <Badge variant="outline">Version {proposal.version}</Badge>
                <Badge variant="secondary">
                  {PHASE_PROPOSAL_STATUS_LABELS[proposal.status]}
                </Badge>
                <RoadmapStatusBadge status={phase1.status} />
              </div>
              <CardTitle className="mt-3 text-2xl">
                Phase {phase1.phaseNumber} — {phase1.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Client: {company.name} · Timeline: {phase1.timeline} · Expected improvement: +
                {phase1.stackScoreImprovement} StackScore
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Scope summary</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {proposal.scopeSummary}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground">Included initiatives</h3>
                <ul className="mt-3 space-y-2">
                  {phase1.initiatives.map((initiative) => (
                    <li
                      key={initiative.id}
                      className="rounded-lg border border-border/60 px-3 py-2 text-sm text-muted-foreground"
                    >
                      {initiative.title}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Deliverables</h3>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {phase1.deliverables.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Assumptions</h3>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {phase1.assumptions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-xl border border-border/70 bg-muted/10 p-5">
                <h3 className="text-sm font-semibold text-foreground">Investment — Phase 1 only</h3>
                <DemoInvestmentSummary
                  className="mt-4"
                  oneTimeInvestment={phase1.oneTimeInvestment}
                  monthlyRecurringInvestment={phase1.monthlyRecurringInvestment}
                  showMonthlyRecurring={phase1.showMonthlyRecurring}
                  monthlyRecurringLabel={phase1.monthlyRecurringLabel}
                />
                <p className="mt-3 text-xs text-muted-foreground">
                  Future-phase pricing is intentionally excluded from this proposal.
                </p>
              </div>

              <blockquote className="rounded-xl border-l-4 border-primary/40 bg-primary/5 px-4 py-3 text-sm leading-relaxed text-foreground">
                {proposal.approvalLanguage}
              </blockquote>

              <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
                Interactive Demo — No real approval will be submitted. This action updates local demo
                state only.
              </div>

              {justApproved || stage !== "phase1_awaiting_approval" ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-700" aria-hidden />
                    <div>
                      <p className="font-semibold text-emerald-950">
                        Phase 1 {proposal.status === "approved" ? "approved" : "ready"} in demo
                      </p>
                      <p className="mt-1 text-sm text-emerald-900/80">
                        Proposal and roadmap statuses are synchronized. Continue to implementation
                        progress to see how work is tracked.
                      </p>
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        {canStartImplementation ? (
                          <Button
                            type="button"
                            className="h-11 px-6"
                            onClick={() => {
                              startImplementation();
                              scrollToSection("product-overview-implementation");
                            }}
                          >
                            Continue to Implementation
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          variant="outline"
                          className="h-11 px-6"
                          onClick={() => scrollToSection("product-overview-implementation")}
                        >
                          View Implementation Progress
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {canApprovePhase1 ? (
                <Button type="button" className="h-11 px-6" onClick={handleApprove}>
                  Approve Phase 1 in Demo
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </OfferReveal>
      </div>
    </section>
  );
}
