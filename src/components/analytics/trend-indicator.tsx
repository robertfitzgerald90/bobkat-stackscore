"use client";

import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

type TrendIndicatorProps = {
  delta: number | null | undefined;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
};

export function TrendIndicator({
  delta,
  size = "sm",
  showLabel = true,
  className,
}: TrendIndicatorProps) {
  if (delta === null || delta === undefined) {
    return <span className={cn("text-muted-foreground", className)}>—</span>;
  }

  const iconClass = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const textClass = size === "sm" ? "text-xs" : "text-sm";

  if (delta === 0) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 font-medium text-muted-foreground",
          textClass,
          className,
        )}
      >
        <Minus className={iconClass} />
        {showLabel ? "No change" : "0"}
      </span>
    );
  }

  const positive = delta > 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-semibold tabular-nums",
        textClass,
        positive ? "text-success" : "text-destructive",
        className,
      )}
    >
      {positive ? <TrendingUp className={iconClass} /> : <TrendingDown className={iconClass} />}
      {positive ? "+" : ""}
      {delta}
      {showLabel ? " pts" : ""}
    </span>
  );
}
