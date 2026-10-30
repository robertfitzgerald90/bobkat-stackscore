import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Compass,
  Flag,
  ListChecks,
  Map,
} from "lucide-react";
import {
  ClientEmptyState,
  ClientSectionHeader,
  ClientStatusBadge,
} from "@/components/client-ui";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { PRIORITY_BADGE } from "@/components/technology-profile/tp-constants";
import {
  CLIENT_METRIC_VALUE,
  CLIENT_SURFACE_CARD,
  CLIENT_SURFACE_CARD_INDUSTRIAL,
} from "@/lib/client-ui/tokens";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import type {
  CustomerPillarControlFinding,
  CustomerPillarDetailDto,
  CustomerPillarOpportunity,
  CustomerPillarProjectItem,
  CustomerPillarRoadmapItem,
} from "@/lib/customer-portal/pillar-detail-dto";
import { cn } from "@/lib/utils";

type PillarDetailPanelProps = {
  detail: CustomerPillarDetailDto;
  className?: string;
};

export function PillarDetailPanel({ detail, className }: PillarDetailPanelProps) {
  return (
    <article
      className={cn(CLIENT_SURFACE_CARD_INDUSTRIAL, "space-y-6 p-5 sm:p-6", className)}
      aria-labelledby={`pillar-detail-${detail.code}`}
    >
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Pillar overview
        </p>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2
              id={`pillar-detail-${detail.code}`}
              className="text-xl font-bold tracking-tight text-foreground sm:text-2xl"
            >
              {detail.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{detail.businessQuestion}</p>
          </div>
          <div className="rounded-sm border border-border/70 bg-muted/20 px-4 py-3 text-right">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
              Official score
            </p>
            <p
              className={cn(
                "text-3xl font-semibold",
                CLIENT_METRIC_VALUE,
                detail.score !== null
                  ? getScoreTextColorClass(detail.score)
                  : "text-muted-foreground",
              )}
            >
              {detail.score ?? "—"}
            </p>
            {detail.maturityLabel ? (
              <div className="mt-2 flex justify-end">
                <ClientStatusBadge tone="default">{detail.maturityLabel}</ClientStatusBadge>
              </div>
            ) : null}
          </div>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{detail.maturitySummary}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <MetricChip
            label="Assessed controls"
            value={
              detail.hasCompletedAssessment
                ? String(detail.controlsAssessed)
                : "—"
            }
            hint={
              detail.controlsScorable > 0
                ? `${detail.controlsScorable} included in scoring`
                : undefined
            }
          />
          <MetricChip
            label="Improvement opportunities"
            value={String(detail.opportunityCount)}
            hint="Customer-visible recommendations"
          />
        </div>
      </header>

      <FindingSection
        id={`pillar-working-${detail.code}`}
        title="What's Working"
        emptyTitle="No demonstrated strengths yet"
        emptyDescription="Satisfied assessment controls for this pillar will appear here when recorded."
        items={detail.strengths}
        tone="success"
      />

      <FindingSection
        id={`pillar-attention-${detail.code}`}
        title="What Needs Attention"
        emptyTitle="No gaps recorded for this pillar"
        emptyDescription="Partially satisfied and not-satisfied controls will appear here when present. Nothing is invented to fill this section."
        items={detail.attentionItems}
        tone="warning"
      />

      <section className="space-y-3" aria-labelledby={`pillar-findings-${detail.code}`}>
        <ClientSectionHeader
          title="Assessment findings"
          description="Controls assessed in this pillar with the recorded result."
        />
        <h3 id={`pillar-findings-${detail.code}`} className="sr-only">
          Assessment findings
        </h3>
        {detail.findings.length === 0 ? (
          <ClientEmptyState
            icon={ListChecks}
            title="No assessment findings yet"
            description="Complete an assessment to review control-level results for this pillar."
            variant="default"
          />
        ) : (
          <ul className="space-y-2">
            {detail.findings.map((item) => (
              <li
                key={item.questionCode}
                className={cn(CLIENT_SURFACE_CARD, "rounded-sm border bg-card p-4")}
              >
                <div className="flex flex-wrap items-center gap-2">
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
                <p className="mt-2 text-sm font-medium text-foreground">{item.questionText}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Recorded answer · {item.answerText}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3" aria-labelledby={`pillar-ops-${detail.code}`}>
        <ClientSectionHeader
          title="Improvement opportunities"
          description="Customer-visible recommendations for this pillar. Complexity uses service playbook effort bands when mapped."
          actions={
            <Link
              href={detail.opportunitiesHref}
              className={buttonClassName({ variant: "outline", size: "sm" })}
            >
              View all
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden />
            </Link>
          }
        />
        <h3 id={`pillar-ops-${detail.code}`} className="sr-only">
          Improvement opportunities
        </h3>
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
              <OpportunityRow key={item.id} item={item} />
            ))}
          </ul>
        )}
        <p className="text-xs text-muted-foreground">{detail.complexityFootnote}</p>
      </section>

      <ImprovementActivity
        detailCode={detail.code}
        initiatives={detail.roadmapInitiatives}
        projects={detail.relatedProjects}
        roadmapHref={detail.roadmapHref}
        projectsHref={detail.projectsHref}
      />

      <section className="space-y-3" aria-labelledby={`pillar-next-${detail.code}`}>
        <h3 id={`pillar-next-${detail.code}`} className="text-sm font-semibold text-foreground">
          Recommended next actions
        </h3>
        {detail.nextActions.length === 0 ? (
          <p className="rounded-sm border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            No prioritized next actions for this pillar yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {detail.nextActions.map((item, index) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between gap-3 rounded-sm border border-border bg-muted/15 px-4 py-3 text-sm transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
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
        )}
        <div className="flex flex-wrap gap-2">
          <Link href={detail.roadmapHref} className={buttonClassName({ variant: "outline", size: "sm" })}>
            Open Roadmap
          </Link>
          <Link
            href={detail.projectsHref}
            className={buttonClassName({ variant: "outline", size: "sm" })}
          >
            Open Projects
          </Link>
          <Link
            href={detail.opportunitiesHref}
            className={buttonClassName({ variant: "outline", size: "sm" })}
          >
            All pillar opportunities
          </Link>
        </div>
      </section>
    </article>
  );
}

function MetricChip({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-sm border border-border/60 bg-muted/10 px-3 py-2.5">
      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={cn("mt-1 text-lg font-semibold", CLIENT_METRIC_VALUE)}>{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function FindingSection({
  id,
  title,
  emptyTitle,
  emptyDescription,
  items,
  tone,
}: {
  id: string;
  title: string;
  emptyTitle: string;
  emptyDescription: string;
  items: CustomerPillarControlFinding[];
  tone: "success" | "warning";
}) {
  return (
    <section className="space-y-2" aria-labelledby={id}>
      <h3 id={id} className="text-sm font-semibold text-foreground">
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="rounded-sm border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{emptyTitle}. </span>
          {emptyDescription}
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.questionCode}
              className={cn(CLIENT_SURFACE_CARD, "rounded-sm border bg-card p-4")}
            >
              <div className="flex items-start gap-2">
                {tone === "success" ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
                )}
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <ClientStatusBadge tone={tone === "success" ? "default" : "warning"}>
                      {item.resultLabel}
                    </ClientStatusBadge>
                    {item.isCritical ? (
                      <ClientStatusBadge tone="warning">Critical flag</ClientStatusBadge>
                    ) : null}
                  </div>
                  <p className="text-sm font-medium text-foreground">{item.questionText}</p>
                  <p className="text-xs text-muted-foreground">
                    Recorded answer · {item.answerText}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function OpportunityRow({ item }: { item: CustomerPillarOpportunity }) {
  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          CLIENT_SURFACE_CARD,
          "flex flex-col gap-2 rounded-sm border bg-card p-4 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
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
            <span className="font-semibold text-foreground/80">Recommended action · </span>
            {item.recommendedAction}
          </p>
        ) : null}
        {item.expectedOutcome ? (
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground/80">Expected outcome · </span>
            {item.expectedOutcome}
          </p>
        ) : null}
        {!item.finding && !item.recommendedAction && item.businessImpact ? (
          <p className="text-xs text-muted-foreground">{item.businessImpact}</p>
        ) : null}
      </Link>
    </li>
  );
}

function ImprovementActivity({
  detailCode,
  initiatives,
  projects,
  roadmapHref,
  projectsHref,
}: {
  detailCode: string;
  initiatives: CustomerPillarRoadmapItem[];
  projects: CustomerPillarProjectItem[];
  roadmapHref: string;
  projectsHref: string;
}) {
  return (
    <section className="space-y-4" aria-labelledby={`pillar-activity-${detailCode}`}>
      <ClientSectionHeader
        title="Improvement activity"
        description="Roadmap initiatives and projects connected to recommendations in this pillar."
      />
      <h3 id={`pillar-activity-${detailCode}`} className="sr-only">
        Improvement activity
      </h3>

      <div className="space-y-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Map className="h-3.5 w-3.5 text-primary" aria-hidden />
          Roadmap initiatives
        </p>
        {initiatives.length === 0 ? (
          <p className="rounded-sm border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            No roadmap initiatives linked to this pillar yet.{" "}
            <Link href={roadmapHref} className="font-medium text-primary hover:underline">
              Open Roadmap
            </Link>
          </p>
        ) : (
          <ul className="space-y-2">
            {initiatives.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={cn(
                    CLIENT_SURFACE_CARD,
                    "flex flex-col gap-1 rounded-sm border bg-card p-4 transition-colors hover:border-primary",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <ClientStatusBadge tone="muted">{item.statusLabel}</ClientStatusBadge>
                    <span className="text-xs text-muted-foreground">Phase · {item.phaseName}</span>
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
        {projects.length === 0 ? (
          <p className="rounded-sm border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            No projects linked to this pillar yet.{" "}
            <Link href={projectsHref} className="font-medium text-primary hover:underline">
              Open Projects
            </Link>
          </p>
        ) : (
          <ul className="space-y-2">
            {projects.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={cn(
                    CLIENT_SURFACE_CARD,
                    "flex flex-col gap-1 rounded-sm border bg-card p-4 transition-colors hover:border-primary",
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
    </section>
  );
}
