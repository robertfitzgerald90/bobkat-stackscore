import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ReportSectionProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  variant?: "default" | "accent";
};

export function ReportSection({
  title,
  subtitle,
  children,
  className,
  variant = "default",
}: ReportSectionProps) {
  return (
    <section className={cn("report-section break-inside-avoid", className)}>
      <div
        className={cn(
          "mb-4",
          variant === "accent" ? "border-b border-primary/20 pb-2" : "border-b-2 border-primary pb-2",
        )}
      >
        <h4
          className={cn(
            "font-bold text-primary",
            variant === "default" ? "text-lg" : "text-sm",
          )}
        >
          {title}
        </h4>
        {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function ReportEmptyState({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}
