import { Badge } from "@/components/ui/badge";
import { formatPriority } from "@/lib/display";
import type { Priority } from "@/generated/prisma/client";

type FindingSeverityBadgeProps = {
  severity: Priority;
};

const VARIANT: Record<Priority, "destructive" | "warning" | "secondary" | "outline"> = {
  critical: "destructive",
  high: "warning",
  medium: "secondary",
  low: "outline",
};

export function FindingSeverityBadge({ severity }: FindingSeverityBadgeProps) {
  return (
    <Badge variant={VARIANT[severity]}>
      {severity === "critical" ? "Critical Finding" : `${formatPriority(severity)} Priority`}
    </Badge>
  );
}
