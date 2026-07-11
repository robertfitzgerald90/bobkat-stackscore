import { Badge } from "@/components/ui/badge";
import { PRIORITY_LABELS } from "@/lib/display";
import { REPORT_PRIORITY_BADGE_CLASS } from "@/lib/reports/tokens";
import { cn } from "@/lib/utils";
import type { Priority } from "@/generated/prisma/client";

const REPORT_DOCUMENT_PRIORITY_CLASS: Record<Priority, string> = {
  critical: "report-priority-critical",
  high: "report-priority-high",
  medium: "report-priority-medium",
  low: "report-priority-low",
};

type ReportPriorityBadgeProps = {
  priority: Priority;
  className?: string;
  showLabel?: boolean;
  documentTheme?: boolean;
};

export function ReportPriorityBadge({
  priority,
  className,
  showLabel = true,
  documentTheme = false,
}: ReportPriorityBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        documentTheme ? REPORT_DOCUMENT_PRIORITY_CLASS[priority] : REPORT_PRIORITY_BADGE_CLASS[priority],
        className,
      )}
    >
      {showLabel ? PRIORITY_LABELS[priority] : priority}
    </Badge>
  );
}

export function ReportPriorityChip({
  priority,
  className,
  documentTheme = false,
}: {
  priority: Priority;
  className?: string;
  documentTheme?: boolean;
}) {
  return (
    <span
      className={cn(
        "shrink-0 rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        documentTheme ? REPORT_DOCUMENT_PRIORITY_CLASS[priority] : REPORT_PRIORITY_BADGE_CLASS[priority],
        className,
      )}
    >
      {priority}
    </span>
  );
}
