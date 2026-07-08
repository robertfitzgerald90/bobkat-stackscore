import { cn } from "@/lib/utils";

type SnapshotProgressProps = {
  currentStep: number;
  totalSteps: number;
  label?: string;
  className?: string;
};

export function SnapshotProgress({
  currentStep,
  totalSteps,
  label = "Progress",
  className,
}: SnapshotProgressProps) {
  const percent =
    totalSteps > 0 ? Math.min(100, Math.round((currentStep / totalSteps) * 100)) : 0;

  return (
    <div className={cn("min-w-0 space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className="shrink-0 tabular-nums text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
