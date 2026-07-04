import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { REPORT_PRINT_ROOT_CLASS } from "@/lib/reports/types";

type ReportShellProps = {
  children: ReactNode;
  className?: string;
};

export function ReportShell({ children, className }: ReportShellProps) {
  return (
    <div className={cn(REPORT_PRINT_ROOT_CLASS, "min-w-0 max-w-full space-y-6 print:space-y-4", className)}>
      {children}
    </div>
  );
}
