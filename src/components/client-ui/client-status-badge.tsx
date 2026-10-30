import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ClientStatusBadgeProps = {
  children: ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "muted";
  className?: string;
};

const TONE_CLASS: Record<NonNullable<ClientStatusBadgeProps["tone"]>, string> = {
  default: "",
  success: "border-success/30 bg-success/10 text-success",
  /* Amber reserved for warnings; phosphor remains primary accent (SS-UX-003). */
  warning: "border-warning/40 bg-warning/10 text-warning",
  danger: "border-destructive/30 bg-destructive/10 text-destructive",
  muted: "border-border bg-muted/40 text-muted-foreground",
};

/** Compact status chip aligned with Interactive Demo badge treatment. */
export function ClientStatusBadge({
  children,
  tone = "default",
  className,
}: ClientStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[0.65rem] font-semibold uppercase tracking-wide",
        TONE_CLASS[tone],
        className,
      )}
    >
      {children}
    </Badge>
  );
}
