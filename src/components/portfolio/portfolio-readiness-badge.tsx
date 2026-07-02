import type { PortfolioReadinessStatus } from "@/lib/portfolio/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const READINESS_CONFIG: Record<
  PortfolioReadinessStatus,
  { label: string; variant: "success" | "warning" | "destructive" | "secondary" }
> = {
  ready: { label: "Ready", variant: "success" },
  partial: { label: "Partial", variant: "warning" },
  blocked: { label: "Blocked", variant: "destructive" },
  healthy: { label: "Healthy", variant: "secondary" },
};

type PortfolioReadinessBadgeProps = {
  status: PortfolioReadinessStatus;
  className?: string;
};

export function PortfolioReadinessBadge({ status, className }: PortfolioReadinessBadgeProps) {
  const config = READINESS_CONFIG[status];
  return (
    <Badge variant={config.variant} className={cn("shrink-0 text-[10px] uppercase", className)}>
      {config.label}
    </Badge>
  );
}
