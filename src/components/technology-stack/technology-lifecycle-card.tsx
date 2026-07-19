import { formatDisplayDate } from "@/lib/display";
import { formatMoney } from "@/lib/billing/money";
import { cn } from "@/lib/utils";

export type TechnologyLifecycleCostLine = {
  label: string;
  amountCents?: number | null;
  note?: string;
};

export type TechnologyLifecycleItem = {
  id: string;
  name: string;
  provider: string;
  platformLabel?: string;
  lifecycleStatus?: string;
  renewalDate?: string | null;
  warrantyExpiresAt?: string | null;
  plannedReplacementDate?: string | null;
  /** @deprecated Prefer `costLines` for accurate one-time vs recurring presentation. */
  annualBudgetCents?: number | null;
  /** @deprecated Prefer `costLines` labels. */
  budgetPeriod?: string | null;
  costLines?: TechnologyLifecycleCostLine[];
};

type TechnologyLifecycleCardProps = {
  item: TechnologyLifecycleItem;
  readOnly?: boolean;
  compact?: boolean;
};

function formatCostLineAmount(amountCents: number | null | undefined): string {
  if (amountCents == null) return "—";
  if (amountCents === 0) return "$0";
  return formatMoney(amountCents);
}

export function TechnologyLifecycleCard({
  item,
  readOnly = false,
  compact = false,
}: TechnologyLifecycleCardProps) {
  const legacyBudgetLabel =
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
      {item.platformLabel ? (
        <p className="text-xs text-muted-foreground">Platform: {item.platformLabel}</p>
      ) : null}
      {item.lifecycleStatus ? (
        <p className="mt-1 text-xs text-muted-foreground">Status: {item.lifecycleStatus}</p>
      ) : null}
      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
        {item.costLines?.map((line) => (
          <div key={`${item.id}-${line.label}`}>
            <p>
              <span className="font-medium text-foreground">{line.label}:</span>{" "}
              {formatCostLineAmount(line.amountCents)}
            </p>
            {line.note ? <p className="pl-0.5 text-[11px] leading-relaxed">{line.note}</p> : null}
          </div>
        ))}
        {item.renewalDate ? <p>Next review: {formatDisplayDate(item.renewalDate)}</p> : null}
        {item.warrantyExpiresAt ? <p>Warranty: {formatDisplayDate(item.warrantyExpiresAt)}</p> : null}
        {item.plannedReplacementDate ? (
          <p>Planned refresh: {formatDisplayDate(item.plannedReplacementDate)}</p>
        ) : null}
        {!item.costLines?.length && legacyBudgetLabel ? (
          <p>
            Budget: {legacyBudgetLabel}
            {item.budgetPeriod ? ` / ${item.budgetPeriod}` : ""}
          </p>
        ) : null}
      </div>
    </div>
  );
}
