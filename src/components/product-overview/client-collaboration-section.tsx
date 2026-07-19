"use client";

import { useState } from "react";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProductOverview } from "@/components/product-overview/product-overview-context";
import {
  COLLABORATION_ARTIFACTS,
  COLLABORATION_PARTICIPANTS,
} from "@/lib/product-overview/demo-partnership";
import { cn } from "@/lib/utils";

export function ClientCollaborationSection() {
  const [activeParticipantId, setActiveParticipantId] = useState(
    COLLABORATION_PARTICIPANTS[0]?.id ?? "technology-advisor",
  );
  const { openDetail } = useProductOverview();
  const activeParticipant =
    COLLABORATION_PARTICIPANTS.find((p) => p.id === activeParticipantId) ??
    COLLABORATION_PARTICIPANTS[0]!;

  return (
    <section
      id="product-overview-collaboration"
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
          <div className="grid gap-3 sm:grid-cols-2">
            {COLLABORATION_PARTICIPANTS.map((participant) => (
              <button
                key={participant.id}
                type="button"
                data-demo-feature={`collaborationParticipant:${participant.id}`}
                onClick={(event) => {
                  setActiveParticipantId(participant.id);
                  openDetail(
                    { type: "collaborationParticipant", participantId: participant.id },
                    event.currentTarget,
                  );
                }}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  activeParticipantId === participant.id
                    ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2"
                    : "border-border/70 bg-card",
                )}
              >
                <p className="font-semibold text-foreground">{participant.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{participant.role}</p>
              </button>
            ))}
          </div>

          <Card className="border-border/70 shadow-sm">
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
          </Card>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {COLLABORATION_ARTIFACTS.map((artifact) => (
            <div key={artifact.id} className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
              <p className="font-medium text-foreground">{artifact.label}</p>
              <p className="mt-2 text-sm text-muted-foreground">{artifact.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
