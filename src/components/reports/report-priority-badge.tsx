import { Badge } from "@/components/ui/badge";
import { PRIORITY_LABELS } from "@/lib/display";
import { REPORT_PRIORITY_BADGE_CLASS } from "@/lib/reports/tokens";
import { cn } from "@/lib/utils";
import type { Priority } from "@/generated/prisma/client";

type ReportPriorityBadgeProps = {
  priority: Priority;
  className?: string;
  showLabel?: boolean;
};

export function ReportPriorityBadge({
  priority,
  className,
  showLabel = true,
}: ReportPriorityBadgeProps) {
  return (
    <Badge variant="outline" className={cn(REPORT_PRIORITY_BADGE_CLASS[priority], className)}>
      {showLabel ? PRIORITY_LABELS[priority] : priority}
    </Badge>
  );
}

export function ReportPriorityChip({
  priority,
  className,
}: {
  priority: Priority;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "shrink-0 rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        REPORT_PRIORITY_BADGE_CLASS[priority],
        className,
      )}
    >
      {priority}
    </span>
  );
}
