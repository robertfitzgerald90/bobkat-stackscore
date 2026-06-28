import { cn } from "@/lib/utils";

type ReportExecutiveSummaryProps = {
  value: string;
  isEditable?: boolean;
  onChange?: (value: string) => void;
  placeholder?: string;
  fallback?: string;
  className?: string;
};

export function ReportExecutiveSummary({
  value,
  isEditable = false,
  onChange,
  placeholder = "Summarize business context, progress, and expected outcomes.",
  fallback,
  className,
}: ReportExecutiveSummaryProps) {
  const displayValue = value || fallback || "";

  if (isEditable && onChange) {
    return (
      <textarea
        className={cn(
          "min-h-28 w-full rounded-lg border bg-background px-3 py-2 text-sm leading-relaxed",
          className,
        )}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={5}
      />
    );
  }

  return (
    <p className={cn("text-sm leading-relaxed text-muted-foreground", className)}>
      {displayValue}
    </p>
  );
}
