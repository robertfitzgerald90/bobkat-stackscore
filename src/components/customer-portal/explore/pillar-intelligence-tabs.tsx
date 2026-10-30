"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Compass, Flag, ListChecks, Map } from "lucide-react";
import {
  ClientEmptyState,
  ClientStatusBadge,
} from "@/components/client-ui";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PRIORITY_BADGE } from "@/components/technology-profile/tp-constants";
import { CLIENT_SURFACE_CARD, CLIENT_SURFACE_CARD_INDUSTRIAL } from "@/lib/client-ui/tokens";
import type { CustomerPillarDetailDto } from "@/lib/customer-portal/pillar-detail-dto";
import { cn } from "@/lib/utils";

type PillarIntelligenceTabsProps = {
  detail: CustomerPillarDetailDto;
};

type IntelligenceTab = "findings" | "recommendations" | "activity";

/** SS-UX-016-R1 — Full-width detailed intelligence tabs. */
export function PillarIntelligenceTabs({ detail }: PillarIntelligenceTabsProps) {
  const [tab, setTab] = useState<IntelligenceTab>("findings");

  return (
    <section
      className={cn(CLIENT_SURFACE_CARD_INDUSTRIAL, "space-y-4 p-4 sm:p-5")}
      aria-label="Detailed intelligence"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Detailed intelligence
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Inspect every assessed control, review opportunities, and see related improvement work.
        </p>
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) => {
          if (value === "findings" || value === "recommendations" || value === "activity") {
            setTab(value);
          }
        }}
        className="gap-4"
      >
        <TabsList variant="line" className="h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="findings" className="px-3 py-1.5">
            Assessment Findings
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="px-3 py-1.5">
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="activity" className="px-3 py-1.5">
            Roadmap &amp; Projects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="findings" className="space-y-3">
          {detail.findings.length === 0 ? (
            <ClientEmptyState
              icon={ListChecks}
              title="No assessment findings yet"
              description="Complete an assessment to review control-level results for this pillar."
              variant="default"
            />
          ) : (
            <ul className="divide-y divide-border/60 rounded-sm border border-border">
              {detail.findings.map((item) => (
                <li key={item.questionCode} className="bg-card px-3 py-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <ClientStatusBadge
                      tone={
                        item.resultKind === "satisfied"
                          ? "default"
                          : item.resultKind === "excluded"
                            ? "muted"
                            : "warning"
                      }
                    >
                      {item.resultLabel}
                    </ClientStatusBadge>
                    {item.isCritical ? (
                      <ClientStatusBadge tone="warning">Critical flag</ClientStatusBadge>
                    ) : null}
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-foreground">{item.questionText}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Recorded answer · {item.answerText}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              Customer-visible recommendations for this pillar.
            </p>
            <Link
              href={detail.opportunitiesHref}
              className={buttonClassName({ variant: "outline", size: "sm" })}
            >
              View all
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          {detail.opportunities.length === 0 ? (
            <ClientEmptyState
              icon={Compass}
              title="No active opportunities for this pillar"
              description="When assessment recommendations map to this domain, they will appear here."
              variant="default"
            />
          ) : (
            <ul className="space-y-2">
              {detail.opportunities.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={cn(
                      CLIENT_SURFACE_CARD,
                      "flex flex-col gap-1.5 rounded-sm border bg-card p-3 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={PRIORITY_BADGE[item.priority]}>{item.priorityLabel}</Badge>
                      <ClientStatusBadge tone="muted">{item.statusLabel}</ClientStatusBadge>
                      <span className="text-xs text-muted-foreground">
                        Complexity · {item.complexity.displayLabel}
                      </span>
                    </div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    {item.finding ? (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground/80">Finding · </span>
                        {item.finding}
                      </p>
                    ) : null}
                    {item.recommendedAction ? (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground/80">
                          Recommended action ·{" "}
                        </span>
                        {item.recommendedAction}
                      </p>
                    ) : null}
                    {item.expectedOutcome ? (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground/80">
                          Expected outcome ·{" "}
                        </span>
                        {item.expectedOutcome}
                      </p>
                    ) : null}
                    {!item.finding && !item.recommendedAction && item.businessImpact ? (
                      <p className="text-xs text-muted-foreground">{item.businessImpact}</p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-muted-foreground">{detail.complexityFootnote}</p>
          {detail.nextActions.length > 0 ? (
            <div className="space-y-2 border-t border-border/60 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Recommended next actions
              </p>
              <ul className="space-y-1.5">
                {detail.nextActions.map((item, index) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className="flex items-center justify-between gap-3 rounded-sm border border-border bg-muted/15 px-3 py-2 text-sm hover:border-primary"
                    >
                      <span className="min-w-0">
                        <span className="text-muted-foreground">{index + 1}. </span>
                        <span className="font-medium text-foreground">{item.title}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="activity" className="space-y-5">
          <div className="space-y-2">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Map className="h-3.5 w-3.5 text-primary" aria-hidden />
              Roadmap initiatives
            </p>
            {detail.roadmapInitiatives.length === 0 ? (
              <p className="rounded-sm border border-dashed border-border bg-muted/20 px-3 py-3 text-sm text-muted-foreground">
                No roadmap initiatives linked to this pillar yet.{" "}
                <Link
                  href={detail.roadmapHref}
                  className="font-medium text-primary hover:underline"
                >
                  Open Roadmap
                </Link>
              </p>
            ) : (
              <ul className="space-y-1.5">
                {detail.roadmapInitiatives.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={cn(
                        CLIENT_SURFACE_CARD,
                        "flex flex-col gap-1 rounded-sm border bg-card p-3 transition-colors hover:border-primary",
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <ClientStatusBadge tone="muted">
                          Recommendation status · {item.statusLabel}
                        </ClientStatusBadge>
                        <span className="text-xs text-muted-foreground">
                          Phase · {item.phaseName}
                        </span>
                      </div>
                      <p className="font-medium text-foreground">{item.title}</p>
                      {item.targetDateLabel ? (
                        <p className="text-xs text-muted-foreground">
                          Target · {item.targetDateLabel}
                        </p>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Flag className="h-3.5 w-3.5 text-primary" aria-hidden />
              Projects
            </p>
            {detail.relatedProjects.length === 0 ? (
              <p className="rounded-sm border border-dashed border-border bg-muted/20 px-3 py-3 text-sm text-muted-foreground">
                No projects linked to this pillar yet.{" "}
                <Link
                  href={detail.projectsHref}
                  className="font-medium text-primary hover:underline"
                >
                  Open Projects
                </Link>
              </p>
            ) : (
              <ul className="space-y-1.5">
                {detail.relatedProjects.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={cn(
                        CLIENT_SURFACE_CARD,
                        "flex flex-col gap-1 rounded-sm border bg-card p-3 transition-colors hover:border-primary",
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <ClientStatusBadge tone="muted">{item.statusLabel}</ClientStatusBadge>
                        <span className="text-xs text-muted-foreground">
                          {item.progressPercent !== null
                            ? `${item.progressPercent}% task progress`
                            : "No tasks yet"}
                        </span>
                      </div>
                      <p className="font-medium text-foreground">{item.title}</p>
                      {item.nextMilestoneTitle ? (
                        <p className="text-xs text-muted-foreground">
                          Next milestone · {item.nextMilestoneTitle}
                        </p>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={detail.roadmapHref}
              className={buttonClassName({ variant: "outline", size: "sm" })}
            >
              Open Roadmap
            </Link>
            <Link
              href={detail.projectsHref}
              className={buttonClassName({ variant: "outline", size: "sm" })}
            >
              Open Projects
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
