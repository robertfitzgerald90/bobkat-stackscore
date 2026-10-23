import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function VisualFrame({
  children,
  className,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden border border-border bg-card", className)}>
      {label ? (
        <div className="instrument-mono border-b border-border bg-muted/40 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="instrument-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
      {children}
    </div>
  );
}

export function Metric({
  label,
  value,
  detail,
  tone = "default",
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: "default" | "good" | "risk" | "warning";
}) {
  const toneClass = {
    default: "text-foreground",
    good: "text-success",
    risk: "text-destructive",
    warning: "text-warning",
  }[tone];
  return (
    <div className="border-l border-border pl-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("instrument-mono mt-1 text-xl font-semibold", toneClass)}>{value}</div>
      {detail ? <div className="mt-1 text-xs text-muted-foreground">{detail}</div> : null}
    </div>
  );
}

export function IconLabel({
  icon: Icon,
  children,
  tone = "default",
}: {
  icon: LucideIcon;
  children: React.ReactNode;
  tone?: "default" | "good" | "risk" | "warning";
}) {
  const toneClass = {
    default: "text-muted-foreground",
    good: "text-success",
    risk: "text-destructive",
    warning: "text-warning",
  }[tone];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs", toneClass)}>
      <Icon className="size-3.5" aria-hidden="true" />
      {children}
    </span>
  );
}

export function ProgressBar({ value, risk = false }: { value: number; risk?: boolean }) {
  return (
    <div className="h-1.5 overflow-hidden bg-muted" aria-label={`${value} percent`}>
      <div
        className={cn("h-full transition-[width] duration-700 motion-reduce:transition-none", risk ? "bg-destructive" : "bg-primary")}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function ArrowConnector({ vertical = false }: { vertical?: boolean }) {
  return vertical ? (
    <div className="mx-auto h-6 w-px bg-border after:block after:size-1.5 after:translate-x-[-2.5px] after:translate-y-5 after:rotate-45 after:border-b after:border-r after:border-primary" />
  ) : (
    <div className="relative hidden h-px min-w-5 flex-1 bg-border after:absolute after:right-0 after:top-[-3px] after:size-1.5 after:rotate-[-45deg] after:border-b after:border-r after:border-primary md:block" />
  );
}

