import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type ReportDeltaProps = {
  value: number | null;
  compact?: boolean;
  showSign?: boolean;
  className?: string;
};

export function ReportDelta({
  value,
  compact = false,
  showSign = true,
  className,
}: ReportDeltaProps) {
  if (value === null) {
    return <span className={cn("text-muted-foreground", className)}>—</span>;
  }

  const Icon = value > 0 ? ArrowUp : value < 0 ? ArrowDown : Minus;
  const color =
    value > 0 ? "text-emerald-700" : value < 0 ? "text-red-700" : "text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-semibold",
        compact ? "text-sm" : "text-base",
        color,
        className,
      )}
    >
      <Icon className={cn(compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
      {showSign && value > 0 ? "+" : ""}
      {value}
    </span>
  );
}

export function ReportDeltaSuccess({
  change,
  compact = false,
}: {
  change: number;
  compact?: boolean;
}) {
  const Icon = change > 0 ? ArrowUp : change < 0 ? ArrowDown : Minus;
  const color =
    change > 0 ? "text-success" : change < 0 ? "text-destructive" : "text-muted-foreground";

  return (
    <span className={cn("inline-flex items-center gap-1 text-sm font-medium", color)}>
      <Icon className={cn(compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
      {change > 0 ? "+" : ""}
      {change}
    </span>
  );
}
