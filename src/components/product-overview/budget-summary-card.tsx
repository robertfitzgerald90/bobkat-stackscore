"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDemoCurrency } from "@/lib/product-overview/demo-dashboard";
import type { DemoBudgetPlan } from "@/lib/product-overview/types";

type BudgetSummaryCardProps = {
  budget: DemoBudgetPlan;
  compact?: boolean;
};

export function BudgetSummaryCard({ budget, compact = false }: BudgetSummaryCardProps) {
  const approvedPercent = Math.round((budget.approved / budget.planned) * 100);
  const committedPercent = Math.round((budget.committed / budget.approved) * 100);

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className={cn("pb-3", compact && "px-4 pt-4")}>
        <CardTitle className={cn("text-base", compact && "text-sm")}>Annual Technology Plan</CardTitle>
      </CardHeader>
      <CardContent className={cn("space-y-4", compact && "px-4 pb-4")}>
        <dl className="grid grid-cols-2 gap-3">
          <div>
            <dt className="text-xs text-muted-foreground">Planned</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">{formatDemoCurrency(budget.planned)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Approved</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">{formatDemoCurrency(budget.approved)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Committed</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">{formatDemoCurrency(budget.committed)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Remaining</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">{formatDemoCurrency(budget.remaining)}</dd>
          </div>
        </dl>
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Approved against plan</span>
            <span>{approvedPercent}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary/80" style={{ width: `${approvedPercent}%` }} />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Committed against approved</span>
            <span>{committedPercent}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-secondary" style={{ width: `${committedPercent}%` }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
