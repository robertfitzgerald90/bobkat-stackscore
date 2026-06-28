import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ReportDocumentProps = {
  children: ReactNode;
  className?: string;
};

export function ReportDocument({ children, className }: ReportDocumentProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-white shadow-sm print:shadow-none",
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
