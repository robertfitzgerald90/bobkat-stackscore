import type { ReactNode } from "react";

/** Keeps grouped content on one page when printing (e.g. section lead-in + first card). */
export function ReportPrintLeadGroup({ children }: { children: ReactNode }) {
  return <div className="report-print-lead-group">{children}</div>;
}
