"use client";

import { useId, useState } from "react";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { HorizontalScrollTabList } from "@/components/ui/horizontal-scroll-tab-list";
import { DEMO_INLINE_DETAIL_SECTIONS } from "@/lib/product-overview/demo-interaction";
import { ECOSYSTEM_NODES } from "@/lib/product-overview/demo-partnership";
import { cn } from "@/lib/utils";

/**
 * Master-detail ecosystem map.
 * interactionMode: inline-detail — no FeaturePopover.
 */
export function StackscoreEcosystemSection() {
  const panelId = useId();
  const [activeNodeId, setActiveNodeId] = useState(ECOSYSTEM_NODES[0]?.id ?? "assessment");
  const activeNode = ECOSYSTEM_NODES.find((node) => node.id === activeNodeId) ?? ECOSYSTEM_NODES[0]!;

  return (
    <section
      id={DEMO_INLINE_DETAIL_SECTIONS.ecosystem.sectionId}
      data-demo-interaction={DEMO_INLINE_DETAIL_SECTIONS.ecosystem.interactionMode}
      data-demo-presentation={DEMO_INLINE_DETAIL_SECTIONS.ecosystem.presentation}
      className="scroll-mt-[var(--demo-shell-height,9rem)] overflow-x-clip border-t border-border/70 bg-background px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto min-w-0 max-w-7xl">
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

        <div className="mt-10 min-w-0">
          <HorizontalScrollTabList
            items={ECOSYSTEM_NODES.map((node) => ({ id: node.id, label: node.label }))}
            activeId={activeNodeId}
            onActiveChange={setActiveNodeId}
            ariaLabel="StackScore ecosystem capabilities"
            panelId={panelId}
            idPrefix={panelId}
            tabClassName={(isActive) =>
              cn(
                "shrink-0 snap-start rounded-xl border px-4 py-3 text-left text-sm font-semibold whitespace-nowrap transition-all duration-200 ease-out motion-reduce:transition-none",
                "min-h-11 min-w-[9.5rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(8,47,91,0.25),0_0_28px_rgba(8,47,91,0.28)]"
                  : "border-border/70 bg-card text-foreground hover:border-primary/30 hover:bg-muted/30",
              )
            }
          />
        </div>

        <div
          id={panelId}
          role="tabpanel"
          aria-live="polite"
          aria-atomic="true"
          aria-labelledby={`${panelId}-tab-${activeNode.id}`}
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
