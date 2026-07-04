import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ReportMetricCardProps = {
  label: string;
  value: ReactNode;
  subtitle?: string;
  tone?: "positive" | "negative" | "neutral";
  highlight?: boolean;
  valueClassName?: string;
  className?: string;
};

export function ReportMetricCard({
  label,
  value,
  subtitle,
  tone = "neutral",
  highlight = false,
  valueClassName,
  className,
}: ReportMetricCardProps) {
  return (
    <Card className={cn("stat-card", highlight && "border-primary/20 bg-primary/5", className)}>
      <CardHeader className="pb-2">
        <CardDescription className="text-xs font-medium uppercase tracking-wide">
          {label}
        </CardDescription>
        <CardTitle
          className={cn(
            "text-3xl tabular-nums",
            tone === "positive" && "text-success",
            tone === "negative" && "text-destructive",
            tone === "neutral" && !highlight && "text-brand",
            valueClassName,
          )}
        >
          {value}
        </CardTitle>
      </CardHeader>
      {subtitle ? (
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </CardContent>
      ) : null}
    </Card>
  );
}

type ReportMetricGridProps = {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
};

export function ReportMetricGrid({ children, columns = 3, className }: ReportMetricGridProps) {
  const columnClass =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 4
        ? "sm:grid-cols-2 xl:grid-cols-4"
        : "sm:grid-cols-3";

  return <div className={cn("grid grid-cols-1 gap-4", columnClass, className)}>{children}</div>;
}
