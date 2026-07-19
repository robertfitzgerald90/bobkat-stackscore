"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { useProductOverview } from "@/components/product-overview/product-overview-context";
import { ECOSYSTEM_NODES } from "@/lib/product-overview/demo-partnership";
import { cn } from "@/lib/utils";

export function StackscoreEcosystemSection() {
  const [activeNodeId, setActiveNodeId] = useState(ECOSYSTEM_NODES[0]?.id ?? "assessment");
  const { openDetail } = useProductOverview();
  const activeNode = ECOSYSTEM_NODES.find((node) => node.id === activeNodeId) ?? ECOSYSTEM_NODES[0]!;

  return (
    <section
      id="product-overview-ecosystem"
      className="scroll-mt-36 border-t border-border/70 bg-background px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <OfferReveal>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              The Complete StackScore Ecosystem
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              From assessment to business growth
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Every capability connects in a continuous cycle — technology strategy that drives
              measurable business outcomes.
            </p>
          </div>
        </OfferReveal>

        <div className="mt-10 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max items-start gap-2 px-1">
            {ECOSYSTEM_NODES.map((node, index) => {
              const isActive = node.id === activeNodeId;
              return (
                <div key={node.id} className="flex items-start gap-2">
                  <button
                    type="button"
                    data-demo-feature={`ecosystemNode:${node.id}`}
                    onClick={(event) => {
                      setActiveNodeId(node.id);
                      openDetail(
                        { type: "ecosystemNode", nodeId: node.id },
                        event.currentTarget,
                      );
                    }}
                    className={cn(
                      "w-40 rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-44",
                      isActive
                        ? "scale-105 border-primary bg-primary text-primary-foreground shadow-md"
                        : "border-border/70 bg-card hover:border-primary/30",
                    )}
                  >
                    <p className="text-sm font-semibold">{node.label}</p>
                  </button>
                  {index < ECOSYSTEM_NODES.length - 1 ? (
                    <ChevronDown
                      className="mt-8 hidden h-4 w-4 shrink-0 rotate-[-90deg] text-muted-foreground sm:block"
                      aria-hidden
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <OfferReveal delayMs={100}>
          <div className="mt-8 rounded-2xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
            <p className="text-lg font-semibold text-foreground">{activeNode.label}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{activeNode.description}</p>
            <p className="mt-4 text-sm font-medium text-primary">{activeNode.businessValue}</p>
          </div>
        </OfferReveal>
      </div>
    </section>
  );
}
