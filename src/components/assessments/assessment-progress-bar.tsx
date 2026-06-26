import { cn } from "@/lib/utils";

type AssessmentProgressBarProps = {
  answeredCount: number;
  totalCount: number;
  className?: string;
};

export function AssessmentProgressBar({
  answeredCount,
  totalCount,
  className,
}: AssessmentProgressBarProps) {
  const percent = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;
  const isComplete = answeredCount >= totalCount && totalCount > 0;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground">Assessment Progress</span>
        <span className="tabular-nums text-muted-foreground">
          {answeredCount}/{totalCount} ({percent}%)
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            isComplete ? "bg-primary" : "bg-primary/80",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
