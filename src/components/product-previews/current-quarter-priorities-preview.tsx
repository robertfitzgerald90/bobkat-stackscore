import { CurrentQuarterPriorities } from "@/components/priorities/current-quarter-priorities";
import type { PriorityItem } from "@/components/priorities/current-quarter-priorities";
import { cn } from "@/lib/utils";

type CurrentQuarterPrioritiesPreviewProps = {
  priorities: PriorityItem[];
  className?: string;
};

/**
 * Focused current-quarter priorities panel for marketing pages.
 * Static demo data only — no auth, database, or interactive controls.
 */
export function CurrentQuarterPrioritiesPreview({
  priorities,
  className,
}: CurrentQuarterPrioritiesPreviewProps) {
  return (
    <div
      className={cn("w-full min-w-0", className)}
      aria-label="Current-quarter priorities preview"
    >
      <CurrentQuarterPriorities priorities={priorities} readOnly compact />
    </div>
  );
}
