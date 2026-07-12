import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ReportSectionProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  variant?: "default" | "accent";
  documentTheme?: boolean;
};

export function ReportSection({
  title,
  subtitle,
  children,
  className,
  variant = "default",
  documentTheme = false,
}: ReportSectionProps) {
  return (
    <section className={cn("report-section", className)}>
      <div
        className={cn(
          "report-section-header",
          documentTheme ? "report-section-divider" : "mb-4",
          !documentTheme &&
            (variant === "accent"
              ? "border-b border-primary/20 pb-2"
              : "border-b-2 border-primary pb-2"),
        )}
      >
        <h4
          className={cn(
            documentTheme
              ? cn(
                  "report-section-heading",
                  variant === "accent" && "report-section-heading-accent",
                )
              : cn("font-bold text-primary", variant === "default" ? "text-lg" : "text-sm"),
          )}
        >
          {title}
        </h4>
        {subtitle ? (
          <p
            className={cn(
              documentTheme ? "report-section-subtitle" : "mt-1 text-xs text-muted-foreground",
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      <div className="report-section-body">{children}</div>
    </section>
  );
}

export function ReportEmptyState({
  children,
  documentTheme = false,
}: {
  children: ReactNode;
  documentTheme?: boolean;
}) {
  return (
    <p
      className={cn(
        documentTheme ? "report-empty-state" : "text-sm text-muted-foreground",
      )}
    >
      {children}
    </p>
  );
}
