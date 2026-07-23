import type { ReactNode } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { MiniSparkline } from "@/components/executive-os/mini-sparkline";
import { EXECUTIVE_OS_KPI_CARD } from "@/lib/executive-os/tokens";
import { CLIENT_METRIC_VALUE } from "@/lib/client-ui/tokens";
import { cn } from "@/lib/utils";

export type ExecutiveKpiTrend = "up" | "down" | "neutral";

type ExecutiveKpiCardProps = {
  label: string;
  value: ReactNode;
  description?: string;
  sublabel?: string;
  trend?: ExecutiveKpiTrend;
  trendLabel?: string;
  confidence?: "High" | "Medium" | "Low";
  riskLevel?: string;
  sparkline?: number[];
  emphasizeClassName?: string;
  className?: string;
};

function TrendIcon({ trend }: { trend: ExecutiveKpiTrend }) {
  if (trend === "up") return <ArrowUpRight className="h-3.5 w-3.5 text-success" aria-hidden />;
  if (trend === "down") return <ArrowDownRight className="h-3.5 w-3.5 text-warning" aria-hidden />;
  return <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />;
}

export function ExecutiveKpiCard({
  label,
  value,
  description,
  sublabel,
  trend = "neutral",
  trendLabel,
  confidence,
  riskLevel,
  sparkline,
  emphasizeClassName,
  className,
}: ExecutiveKpiCardProps) {
  return (
    <article className={cn(EXECUTIVE_OS_KPI_CARD, className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        {sparkline && sparkline.length >= 2 ? <MiniSparkline values={sparkline} /> : null}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <p className={cn("text-3xl font-semibold sm:text-[2rem]", CLIENT_METRIC_VALUE, emphasizeClassName)}>
          {value}
        </p>
        {trendLabel ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/20 px-2 py-0.5 text-xs font-medium text-foreground">
            <TrendIcon trend={trend} />
            {trendLabel}
          </span>
        ) : null}
      </div>

      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}

      {sublabel ? <p className="mt-2 text-xs text-muted-foreground">{sublabel}</p> : null}

      {(confidence || riskLevel) && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border/50 pt-3 text-xs">
          {confidence ? (
            <span className="rounded-md bg-primary/10 px-2 py-1 font-medium text-primary">
              Confidence: {confidence}
            </span>
          ) : null}
          {riskLevel ? (
            <span className="rounded-md bg-muted/40 px-2 py-1 font-medium text-muted-foreground">
              Business risk: {riskLevel}
            </span>
          ) : null}
        </div>
      )}
    </article>
  );
}
