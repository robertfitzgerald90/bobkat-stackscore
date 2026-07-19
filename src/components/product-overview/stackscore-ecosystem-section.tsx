"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { DEMO_INLINE_DETAIL_SECTIONS } from "@/lib/product-overview/demo-interaction";
import { ECOSYSTEM_NODES } from "@/lib/product-overview/demo-partnership";
import { cn } from "@/lib/utils";

/**
 * Master-detail ecosystem map.
 * interactionMode: inline-detail — no FeaturePopover.
 */
export function StackscoreEcosystemSection() {
  const detailId = useId();
  const [activeNodeId, setActiveNodeId] = useState(ECOSYSTEM_NODES[0]?.id ?? "assessment");
  const activeNode = ECOSYSTEM_NODES.find((node) => node.id === activeNodeId) ?? ECOSYSTEM_NODES[0]!;

  return (
    <section
      id={DEMO_INLINE_DETAIL_SECTIONS.ecosystem.sectionId}
      data-demo-interaction={DEMO_INLINE_DETAIL_SECTIONS.ecosystem.interactionMode}
      data-demo-presentation={DEMO_INLINE_DETAIL_SECTIONS.ecosystem.presentation}
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
          <div
            className="flex min-w-max items-start gap-2 px-1"
            role="listbox"
            aria-label="StackScore ecosystem capabilities"
            aria-controls={detailId}
          >
            {ECOSYSTEM_NODES.map((node, index) => {
              const isActive = node.id === activeNodeId;
              return (
                <div key={node.id} className="flex items-start gap-2">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => setActiveNodeId(node.id)}
                    className={cn(
                      "w-40 rounded-xl border p-4 text-left transition-all duration-200 ease-out motion-reduce:transition-none sm:w-44",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(8,47,91,0.25),0_0_28px_rgba(8,47,91,0.28)]"
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

        <div
          id={detailId}
          role="region"
          aria-live="polite"
          aria-atomic="true"
          className="mt-8 min-h-[9.5rem] rounded-2xl border border-border/70 bg-card p-6 shadow-sm sm:min-h-[8.5rem] sm:p-8"
        >
          <div
            key={activeNode.id}
            className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200 motion-reduce:animate-none"
          >
            <p className="text-lg font-semibold text-foreground">{activeNode.label}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {activeNode.description}
            </p>
            <p className="mt-4 text-sm font-medium text-primary">{activeNode.businessValue}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
