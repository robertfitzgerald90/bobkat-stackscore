import { formatDisplayDate } from "@/lib/display";
import { formatMoney } from "@/lib/billing/money";
import { cn } from "@/lib/utils";

export type TechnologyLifecycleItem = {
  id: string;
  name: string;
  provider: string;
  renewalDate?: string | null;
  warrantyExpiresAt?: string | null;
  plannedReplacementDate?: string | null;
  annualBudgetCents?: number | null;
  budgetPeriod?: string | null;
};

type TechnologyLifecycleCardProps = {
  item: TechnologyLifecycleItem;
  readOnly?: boolean;
  compact?: boolean;
};

export function TechnologyLifecycleCard({
  item,
  readOnly = false,
  compact = false,
}: TechnologyLifecycleCardProps) {
  const budgetLabel =
    item.annualBudgetCents != null && item.annualBudgetCents > 0
      ? formatMoney(item.annualBudgetCents)
      : null;

  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 text-sm",
        compact ? "p-3" : "p-3",
        readOnly && "pointer-events-none",
      )}
    >
      <p className="break-words font-medium">{item.name}</p>
      <p className="text-muted-foreground">{item.provider}</p>
      <div className="mt-3 space-y-1 text-xs text-muted-foreground">
        {item.renewalDate ? <p>Renewal: {formatDisplayDate(item.renewalDate)}</p> : null}
        {item.warrantyExpiresAt ? <p>Warranty: {formatDisplayDate(item.warrantyExpiresAt)}</p> : null}
        {item.plannedReplacementDate ? (
          <p>Replacement: {formatDisplayDate(item.plannedReplacementDate)}</p>
        ) : null}
        {budgetLabel ? (
          <p>
            Budget: {budgetLabel}
            {item.budgetPeriod ? ` / ${item.budgetPeriod}` : ""}
          </p>
        ) : null}
      </div>
    </div>
  );
}
