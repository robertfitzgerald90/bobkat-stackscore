import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ReportDocumentProps = {
  children: ReactNode;
  className?: string;
  /** When true, applies fixed light document theme independent of app dark mode. */
  documentTheme?: boolean;
};

export function ReportDocument({
  children,
  className,
  documentTheme = false,
}: ReportDocumentProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border shadow-sm print:shadow-none",
        documentTheme
          ? "report-document-theme border-[color:var(--report-border-light)] bg-[color:var(--report-background)]"
          : "border-border bg-white",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ReportBody({ children, className }: ReportDocumentProps) {
  return <div className={cn("space-y-8 px-8 py-8", className)}>{children}</div>;
}

export function ReportPageBreak({ className }: { className?: string }) {
  return <div className={cn("report-page-break", className)} aria-hidden />;
}
