"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Lightbulb, Map, Rocket, Sparkles } from "lucide-react";
import {
  clientRecommendationsDemoData,
  type ClientRecommendationsDemoData,
  type ClientRecommendationsDemoItem,
  type DemoRecommendationPriority,
  type DemoRecommendationStatus,
  type DemoRecommendationType,
} from "./data/client-recommendations-demo-data";
import {
  DemoBadge,
  DemoCard,
  DemoCardContent,
  DemoCardDescription,
  DemoCardHeader,
  DemoCardTitle,
} from "./ui/demo-primitives";
import { cn } from "./utils/cn";
import { formatPriority, priorityBadgeVariant } from "./utils/score-display";

export type RecommendationsWorkspaceDemoProps = {
  data?: ClientRecommendationsDemoData;
  className?: string;
  /** When true, wraps content for marketing screenshot framing. */
  screenshotFrame?: boolean;
};

type Filters = {
  pillar: string;
  priority: DemoRecommendationPriority | "";
  status: DemoRecommendationStatus | "";
  recommendationType: DemoRecommendationType | "all" | "";
};

type DemoAction = {
  recommendationId: string;
  label: string;
  message: string;
};

const STATUS_LABELS: Record<DemoRecommendationStatus, string> = {
  open: "Open",
  accepted: "Accepted",
  in_progress: "In progress",
  planned: "Planned",
};

const PRIORITY_ACCENT: Record<DemoRecommendationPriority, string> = {
  critical: "border-l-destructive bg-destructive/[0.04]",
  high: "border-l-amber-500 bg-amber-500/[0.05]",
  medium: "border-l-primary/60 bg-primary/[0.03]",
  low: "border-l-border bg-muted/20",
};

function filterSelectClassName() {
  return "h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm sm:w-auto sm:min-w-[10rem]";
}

function demoButtonClassName(variant: "primary" | "outline" = "outline") {
  return cn(
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : "border border-border bg-background text-foreground hover:bg-muted/40",
  );
}

export function RecommendationsWorkspaceDemo({
  data = clientRecommendationsDemoData,
  className,
  screenshotFrame = false,
}: RecommendationsWorkspaceDemoProps) {
  const [filters, setFilters] = useState<Filters>({
    pillar: "",
    priority: "",
    status: "",
    recommendationType: "all",
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<DemoAction | null>(null);

  const filtered = useMemo(() => {
    return data.recommendations.filter((item) => {
      if (filters.pillar && item.pillar !== filters.pillar) return false;
      if (filters.priority && item.priority !== filters.priority) return false;
      if (filters.status && item.status !== filters.status) return false;
      if (
        filters.recommendationType &&
        filters.recommendationType !== "all" &&
        item.recommendationType !== filters.recommendationType
      ) {
        return false;
      }
      return true;
    });
  }, [data.recommendations, filters]);

  const runAction = (recommendation: ClientRecommendationsDemoItem, label: string, message: string) => {
    setActiveAction({
      recommendationId: recommendation.id,
      label,
      message,
    });
  };

  return (
    <div
      className={cn(
        "midnight min-w-0 max-w-full overflow-x-clip bg-background text-foreground",
        screenshotFrame && "rounded-xl border border-border/70 shadow-sm",
        className,
      )}
      data-marketing-demo="recommendations-workspace"
    >
      <div className="space-y-5 p-3 sm:space-y-6 sm:p-4 md:p-6">
        <header className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h2 className="page-title break-words text-2xl font-semibold tracking-tight sm:text-3xl">
                {data.clientName}
              </h2>
              <DemoBadge variant="outline">{data.clientStatus}</DemoBadge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Client experience preview</p>
        </header>

        <nav
          aria-label="Client workspace"
          className="flex gap-1 overflow-x-auto border-b border-border/60 pb-px [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory touch-pan-x [&::-webkit-scrollbar]:hidden"
        >
          {data.navigation.map((item) => {
            const selected = item.id === data.activeNavId;
            return (
              <span
                key={item.id}
                className={cn(
                  "shrink-0 snap-start rounded-md px-2.5 py-1.5 text-sm font-medium",
                  selected ? "bg-primary/10 text-primary" : "text-muted-foreground",
                )}
                aria-current={selected ? "page" : undefined}
              >
                {item.label}
              </span>
            );
          })}
        </nav>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" aria-hidden />
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{data.pageTitle}</h1>
          </div>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {data.pageSubtitle}
          </p>
        </div>

        {activeAction ? (
          <div
            className="flex min-w-0 flex-col gap-2 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
            role="status"
          >
            <div className="min-w-0">
              <p className="font-medium text-foreground">{activeAction.label}</p>
              <p className="mt-0.5 text-muted-foreground">{activeAction.message}</p>
            </div>
            <button
              type="button"
              className={demoButtonClassName("outline")}
              onClick={() => setActiveAction(null)}
            >
              Dismiss
            </button>
          </div>
        ) : null}

        <DemoCard>
          <DemoCardHeader>
            <DemoCardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4" aria-hidden />
              Filters
            </DemoCardTitle>
            <DemoCardDescription>
              Narrow by technology pillar, priority, status, or recommendation type.
            </DemoCardDescription>
          </DemoCardHeader>
          <DemoCardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <label className="min-w-0 space-y-1 text-xs text-muted-foreground">
              <span className="block">Technology Pillar</span>
              <select
                className={filterSelectClassName()}
                value={filters.pillar}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, pillar: event.target.value }))
                }
                aria-label="Filter by technology pillar"
              >
                <option value="">All pillars</option>
                {data.pillars.map((pillar) => (
                  <option key={pillar} value={pillar}>
                    {pillar}
                  </option>
                ))}
              </select>
            </label>

            <label className="min-w-0 space-y-1 text-xs text-muted-foreground">
              <span className="block">Priority</span>
              <select
                className={filterSelectClassName()}
                value={filters.priority}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    priority: event.target.value as Filters["priority"],
                  }))
                }
                aria-label="Filter by priority"
              >
                <option value="">All priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>

            <label className="min-w-0 space-y-1 text-xs text-muted-foreground">
              <span className="block">Status</span>
              <select
                className={filterSelectClassName()}
                value={filters.status}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    status: event.target.value as Filters["status"],
                  }))
                }
                aria-label="Filter by status"
              >
                <option value="">All statuses</option>
                <option value="open">Open</option>
                <option value="accepted">Accepted</option>
                <option value="in_progress">In progress</option>
                <option value="planned">Planned</option>
              </select>
            </label>

            <label className="min-w-0 space-y-1 text-xs text-muted-foreground">
              <span className="block">Recommendation Type</span>
              <select
                className={filterSelectClassName()}
                value={filters.recommendationType}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    recommendationType: event.target.value as Filters["recommendationType"],
                  }))
                }
                aria-label="Filter by recommendation type"
              >
                {data.recommendationTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>
          </DemoCardContent>
        </DemoCard>

        <div className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="text-base font-medium">
                {filtered.length} recommendation{filtered.length === 1 ? "" : "s"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Prioritized initiatives connected to assessment findings and business outcomes.
              </p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <DemoCard>
              <DemoCardContent className="py-8 text-center text-sm text-muted-foreground">
                No recommendations match the current filters.
              </DemoCardContent>
            </DemoCard>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {filtered.map((recommendation) => (
                <RecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                  expanded={expandedId === recommendation.id}
                  onToggleDetails={() =>
                    setExpandedId((current) =>
                      current === recommendation.id ? null : recommendation.id,
                    )
                  }
                  onLearnMore={() =>
                    runAction(
                      recommendation,
                      "Learn More",
                      `Demo preview: business context for “${recommendation.title}”.`,
                    )
                  }
                  onStartProject={() =>
                    runAction(
                      recommendation,
                      "Start Project",
                      `Demo action only — would open a project draft for “${recommendation.title}”.`,
                    )
                  }
                  onViewRoadmap={() =>
                    runAction(
                      recommendation,
                      "View Roadmap",
                      `Demo action only — would highlight “${recommendation.title}” on the roadmap.`,
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({
  recommendation,
  expanded,
  onToggleDetails,
  onLearnMore,
  onStartProject,
  onViewRoadmap,
}: {
  recommendation: ClientRecommendationsDemoItem;
  expanded: boolean;
  onToggleDetails: () => void;
  onLearnMore: () => void;
  onStartProject: () => void;
  onViewRoadmap: () => void;
}) {
  return (
    <article
      className={cn(
        "min-w-0 overflow-hidden rounded-xl border border-[rgba(70,120,255,0.12)] border-l-4 bg-card shadow-sm transition-all duration-300",
        PRIORITY_ACCENT[recommendation.priority],
      )}
    >
      <div className="space-y-4 p-4 sm:p-5">
        <header className="space-y-3">
          <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
            <h3 className="min-w-0 flex-1 text-base font-semibold leading-snug tracking-tight sm:text-lg">
              {recommendation.title}
            </h3>
            <DemoBadge
              variant={priorityBadgeVariant(recommendation.priority)}
              className="uppercase tracking-wide"
            >
              {formatPriority(recommendation.priority)}
            </DemoBadge>
          </div>

          <div className="flex flex-wrap gap-2">
            <DemoBadge variant="outline">{recommendation.pillar}</DemoBadge>
            <DemoBadge variant="secondary">{STATUS_LABELS[recommendation.status]}</DemoBadge>
            <DemoBadge variant="outline">{recommendation.implementationPhase}</DemoBadge>
          </div>
        </header>

        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Why this matters
          </p>
          <p className="text-sm leading-relaxed text-foreground/90">
            {recommendation.whyThisMatters}
          </p>
        </section>

        <section className="rounded-lg border border-border/50 bg-background/80 px-3 py-3 sm:px-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Business impact
          </p>
          <p className="mt-1 text-sm leading-relaxed">{recommendation.businessImpact}</p>
        </section>

        <dl className="grid gap-3 sm:grid-cols-2">
          <Meta
            label="Estimated maturity improvement"
            value={`+${recommendation.estimatedMaturityImprovement} StackScore points`}
            emphasize
          />
          <Meta label="Latest assessment" value={recommendation.latestAssessment} />
          <Meta label="Suggested service" value={recommendation.suggestedService} />
          <Meta label="Implementation phase" value={recommendation.implementationPhase} />
        </dl>

        {expanded ? (
          <div className="space-y-3 rounded-lg border bg-muted/20 p-3 sm:p-4">
            <Meta label="Trigger evidence" value={recommendation.triggerEvidence} />
            <Meta label="Expected outcome" value={recommendation.expectedOutcome} />
            <Meta label="Business outcome" value={recommendation.businessOutcome} />
            <Meta label="Recommended next step" value={recommendation.recommendedNextStep} />
          </div>
        ) : null}

        <footer className="flex flex-col gap-2 border-t border-border/60 pt-4 sm:flex-row sm:flex-wrap">
          <button type="button" className={demoButtonClassName("primary")} onClick={onToggleDetails}>
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            {expanded ? "Hide Details" : "View Details"}
          </button>
          <button type="button" className={demoButtonClassName()} onClick={onLearnMore}>
            Learn More
          </button>
          <button type="button" className={demoButtonClassName()} onClick={onStartProject}>
            <Rocket className="h-3.5 w-3.5" aria-hidden />
            Start Project
          </button>
          <button type="button" className={demoButtonClassName()} onClick={onViewRoadmap}>
            <Map className="h-3.5 w-3.5" aria-hidden />
            View Roadmap
          </button>
        </footer>
      </div>
    </article>
  );
}

function Meta({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "mt-1 break-words text-sm",
          emphasize ? "font-semibold tabular-nums text-primary" : "text-foreground",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
