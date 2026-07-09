"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Printer } from "lucide-react";
import { buttonClassName } from "@/components/ui/button";

type AssessmentReportToolbarProps = {
  backHref: string;
  backLabel: string;
  downloadHref: string;
  extraActions?: ReactNode;
};

export function AssessmentReportToolbar({
  backHref,
  backLabel,
  downloadHref,
  extraActions,
}: AssessmentReportToolbarProps) {
  function handlePrint() {
    window.print();
  }

  return (
    <div className="report-toolbar report-no-print">
      <div className="report-toolbar-actions">
        <a
          href={downloadHref}
          className={buttonClassName({ variant: "default", className: "report-toolbar-btn" })}
        >
          Download PDF
        </a>
        <button
          type="button"
          onClick={handlePrint}
          className={buttonClassName({ variant: "outline", className: "report-toolbar-btn" })}
        >
          <Printer className="mr-2 h-4 w-4" />
          Print Report
        </button>
        <Link
          href={backHref}
          className={buttonClassName({ variant: "ghost", className: "report-toolbar-btn" })}
        >
          {backLabel}
        </Link>
        {extraActions}
      </div>
    </div>
  );
}
