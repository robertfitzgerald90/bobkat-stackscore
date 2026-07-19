"use client";

import { useId, useState } from "react";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEMO_INLINE_DETAIL_SECTIONS } from "@/lib/product-overview/demo-interaction";
import {
  COLLABORATION_ARTIFACTS,
  COLLABORATION_PARTICIPANTS,
} from "@/lib/product-overview/demo-partnership";
import { cn } from "@/lib/utils";

/**
 * Master-detail collaboration map.
 * interactionMode: inline-detail — no FeaturePopover.
 */
export function ClientCollaborationSection() {
  const detailId = useId();
  const [activeParticipantId, setActiveParticipantId] = useState(
    COLLABORATION_PARTICIPANTS[0]?.id ?? "technology-advisor",
  );
  const activeParticipant =
    COLLABORATION_PARTICIPANTS.find((p) => p.id === activeParticipantId) ??
    COLLABORATION_PARTICIPANTS[0]!;

  return (
    <section
      id={DEMO_INLINE_DETAIL_SECTIONS.collaboration.sectionId}
      data-demo-interaction={DEMO_INLINE_DETAIL_SECTIONS.collaboration.interactionMode}
      data-demo-presentation={DEMO_INLINE_DETAIL_SECTIONS.collaboration.presentation}
      className="scroll-mt-36 border-t border-border/70 bg-muted/10 px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <OfferReveal>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Client Collaboration
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Everyone stays aligned on technology strategy
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              StackScore is a communication platform — not just reporting software. Technology
              advisors, executives, IT staff, and business leaders share one source of truth.
            </p>
          </div>
        </OfferReveal>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div
            className="grid gap-3 sm:grid-cols-2"
            role="listbox"
            aria-label="Collaboration stakeholders"
            aria-controls={detailId}
          >
            {COLLABORATION_PARTICIPANTS.map((participant) => {
              const selected = activeParticipantId === participant.id;
              return (
                <button
                  key={participant.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => setActiveParticipantId(participant.id)}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-all duration-200 ease-out motion-reduce:transition-none",
                    "hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    selected
                      ? "border-primary bg-primary/8 shadow-[0_0_0_1px_rgba(8,47,91,0.2),0_0_24px_rgba(8,47,91,0.18)]"
                      : "border-border/70 bg-card",
                  )}
                >
                  <p className="font-semibold text-foreground">{participant.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{participant.role}</p>
                </button>
              );
            })}
          </div>

          <Card
            id={detailId}
            role="region"
            aria-live="polite"
            aria-atomic="true"
            className="border-border/70 shadow-sm"
          >
            <div
              key={activeParticipant.id}
              className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200 motion-reduce:animate-none"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{activeParticipant.label}</CardTitle>
                <Badge variant="outline">{activeParticipant.role}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {activeParticipant.description}
                </p>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Stays aligned through
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {activeParticipant.connections.map((connection) => (
                      <Badge key={connection} variant="secondary">
                        {connection}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {COLLABORATION_ARTIFACTS.map((artifact) => (
            <div
              key={artifact.id}
              className="rounded-xl border border-border/70 bg-card p-4 shadow-sm"
            >
              <p className="font-medium text-foreground">{artifact.label}</p>
              <p className="mt-2 text-sm text-muted-foreground">{artifact.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
