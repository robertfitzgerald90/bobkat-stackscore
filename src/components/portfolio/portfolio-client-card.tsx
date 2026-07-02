import Link from "next/link";
import { AlertTriangle, FolderKanban, Target } from "lucide-react";
import { PortfolioReadinessBadge } from "@/components/portfolio/portfolio-readiness-badge";
import { PortfolioSparkline } from "@/components/portfolio/portfolio-sparkline";
import { clientImmediateFocusPath } from "@/lib/clients/paths";
import { formatRelativeDisplayDate } from "@/lib/display";
import type { PortfolioClientCard } from "@/lib/portfolio/types";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import { cn } from "@/lib/utils";

type PortfolioClientCardProps = {
  card: PortfolioClientCard;
};

function MetricPill({
  icon: Icon,
  label,
  value,
  emphasize = false,
}: {
  icon: typeof FolderKanban;
  label: string;
  value: number;
  emphasize?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-1 rounded-md px-1.5 py-1 text-[11px]",
        emphasize ? "bg-destructive/10 text-destructive" : "bg-muted/50 text-muted-foreground",
      )}
      title={`${value} ${label}`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span className="truncate font-medium tabular-nums">{value}</span>
      <span className="hidden truncate sm:inline">{label}</span>
    </div>
  );
}

export function PortfolioClientCardView({ card }: PortfolioClientCardProps) {
  const lastAssessedLabel = card.lastAssessmentDate
    ? formatRelativeDisplayDate(card.lastAssessmentDate)
    : "Never assessed";

  return (
    <Link
      href={clientImmediateFocusPath(card.clientId)}
      className="group flex min-w-0 flex-col gap-3 rounded-lg border border-border/70 bg-card p-3 shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-4"
    >
      <div className="flex min-w-0 items-start justify-between gap-2">
        <h3 className="min-w-0 truncate text-sm font-semibold leading-tight group-hover:text-primary sm:text-base">
          {card.companyName}
        </h3>
        <PortfolioReadinessBadge status={card.readinessStatus} />
      </div>

      <div className="flex min-w-0 items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            StackScore
          </p>
          <p
            className={cn(
              "text-2xl font-bold tabular-nums leading-none sm:text-3xl",
              getScoreTextColorClass(card.currentStackScore),
            )}
          >
            {card.currentStackScore ?? "—"}
          </p>
          {card.projectedStackScore !== null && card.currentStackScore !== null ? (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Projected{" "}
              <span className="font-semibold tabular-nums text-foreground">
                {card.projectedStackScore}
              </span>
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-muted-foreground">No projection</p>
          )}
        </div>
        <PortfolioSparkline points={card.scoreTrend} />
      </div>

      <div className="grid min-w-0 grid-cols-3 gap-1.5">
        <MetricPill icon={FolderKanban} label="projects" value={card.openProjectsCount} />
        <MetricPill
          icon={AlertTriangle}
          label="critical"
          value={card.criticalRecommendationsCount}
          emphasize={card.criticalRecommendationsCount > 0}
        />
        <MetricPill
          icon={Target}
          label="focus"
          value={card.immediateFocusCount}
          emphasize={card.immediateFocusCount > 0}
        />
      </div>

      <p className="truncate text-[11px] text-muted-foreground">Assessed {lastAssessedLabel}</p>
    </Link>
  );
}
