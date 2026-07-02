import Link from "next/link";
import { ArrowRight, FolderKanban, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TpEmptyState } from "@/components/technology-profile/tp-empty-state";
import { PRIORITY_BADGE } from "@/components/technology-profile/tp-constants";
import { clientProjectsPath } from "@/lib/clients/paths";
import { PRIORITY_LABELS } from "@/lib/display";
import type { ClientWorkspaceSnapshot, ImmediateFocusItem } from "@/lib/client-workspace";
import { formatFocusMetadataLine } from "@/lib/client-workspace";
import type { NextRecommendedAction } from "@/lib/technology-profile/types";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import { cn } from "@/lib/utils";

type TpWorkspaceSnapshotProps = {
  clientId: string;
  clientName: string;
  workspace: ClientWorkspaceSnapshot;
  nextAction: NextRecommendedAction;
  assessmentsCompleted: number;
};

function KpiCard({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string | number;
  emphasize?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-border/60 bg-card px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-xl font-bold tabular-nums sm:text-2xl",
          emphasize && typeof value === "number" ? getScoreTextColorClass(value) : undefined,
        )}
      >
        {value}
      </p>
    </div>
  );
}

function FocusItemRow({ item }: { item: ImmediateFocusItem }) {
  return (
    <Link
      href={item.href}
      className="group flex min-w-0 items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5 transition-colors hover:border-primary/30 hover:bg-muted/30"
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="min-w-0 truncate text-sm font-semibold leading-snug group-hover:text-primary">
            {item.title}
          </p>
          <Badge
            variant={PRIORITY_BADGE[item.priority]}
            className="shrink-0 text-[10px] uppercase"
          >
            {PRIORITY_LABELS[item.priority]}
          </Badge>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {formatFocusMetadataLine(item)}
        </p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
    </Link>
  );
}

export function TpWorkspaceSnapshot({
  clientId,
  clientName,
  workspace,
  nextAction,
  assessmentsCompleted,
}: TpWorkspaceSnapshotProps) {
  const { kpis, items } = workspace;

  return (
    <section className="space-y-4">
      <div className="min-w-0">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{clientName}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          What deserves your immediate focus?
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="StackScore" value={kpis.stackScore ?? "—"} emphasize />
        <KpiCard
          label="Projected"
          value={kpis.projectedScore ?? "—"}
          emphasize={kpis.projectedScore !== null}
        />
        <KpiCard label="Open Projects" value={kpis.openProjectsCount} />
        <KpiCard
          label="Critical Recs"
          value={kpis.criticalRecommendationsCount}
          emphasize={kpis.criticalRecommendationsCount > 0}
        />
        <KpiCard label="Immediate Focus" value={kpis.immediateFocusCount} />
      </div>

      <Card id="immediate-focus" className="scroll-mt-24 stat-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4" />
                Immediate Focus
              </CardTitle>
              <CardDescription>
                Top {items.length > 0 ? items.length : "priority"} items ready for attention
              </CardDescription>
            </div>
            <Link
              href={clientProjectsPath(clientId)}
              className={buttonClassName({
                variant: "outline",
                size: "sm",
                className: "w-full shrink-0 sm:w-auto",
              })}
            >
              <FolderKanban className="mr-2 h-4 w-4" />
              View Project Register
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {items.length === 0 ? (
            assessmentsCompleted === 0 ? (
              <TpEmptyState
                icon={Target}
                title="Establish the baseline first"
                message="Complete an initial assessment to generate prioritized recommendations and projects."
                actionLabel={nextAction.label}
                actionHref={nextAction.href}
              />
            ) : (
              <TpEmptyState
                icon={Target}
                title="No urgent focus items"
                message="Open work is either complete or waiting on approval. Review recommendations or the project register when priorities shift."
                positive
                actionLabel={nextAction.label}
                actionHref={nextAction.href}
              />
            )
          ) : (
            items.map((item) => <FocusItemRow key={`${item.kind}-${item.id}`} item={item} />)
          )}
        </CardContent>
      </Card>
    </section>
  );
}
