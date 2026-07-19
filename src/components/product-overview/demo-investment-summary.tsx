import {
  formatCurrency,
  formatMonthlyCurrency,
  getStrategicConsultingMonthlyLabel,
} from "@/lib/product-overview/interactive-demo";
import { cn } from "@/lib/utils";

type DemoInvestmentSummaryProps = {
  oneTimeInvestment: number;
  monthlyRecurringInvestment: number;
  showMonthlyRecurring: boolean;
  monthlyRecurringLabel?: "standard" | "strategic_consulting_included";
  className?: string;
  compact?: boolean;
};

/**
 * Always separates one-time and recurring. Never combines into a grand total.
 * Omits the monthly line when there is no recurring component.
 */
export function DemoInvestmentSummary({
  oneTimeInvestment,
  monthlyRecurringInvestment,
  showMonthlyRecurring,
  monthlyRecurringLabel = "standard",
  className,
  compact = false,
}: DemoInvestmentSummaryProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <p className={cn("text-muted-foreground", compact ? "text-xs" : "text-sm")}>
          One-Time Implementation Investment
        </p>
        <p
          className={cn(
            "font-semibold tabular-nums text-foreground",
            compact ? "text-lg" : "text-2xl",
          )}
        >
          {formatCurrency(oneTimeInvestment)}
        </p>
      </div>
      {showMonthlyRecurring ? (
        <div>
          <p className={cn("text-muted-foreground", compact ? "text-xs" : "text-sm")}>
            {monthlyRecurringLabel === "strategic_consulting_included"
              ? "Strategic IT Consulting"
              : "New Monthly Recurring Investment"}
          </p>
          <p
            className={cn(
              "font-semibold tabular-nums text-foreground",
              compact ? "text-lg" : "text-2xl",
            )}
          >
            {monthlyRecurringLabel === "strategic_consulting_included"
              ? getStrategicConsultingMonthlyLabel()
              : formatMonthlyCurrency(monthlyRecurringInvestment)}
          </p>
          {monthlyRecurringLabel === "strategic_consulting_included" ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Included advisory cadence — {getStrategicConsultingMonthlyLabel()}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
