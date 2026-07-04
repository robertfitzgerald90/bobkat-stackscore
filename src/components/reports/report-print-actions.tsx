"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Printer } from "lucide-react";
import { buttonClassName } from "@/components/ui/button";
import { BACK_TO_CLIENT_WORKSPACE_OVERVIEW } from "@/lib/technology-maturity/labels";

type ReportPrintActionsProps = {
  clientName?: string;
  title: string;
  description?: string;
  printLabel?: string;
  backHref?: string;
  backLabel?: string;
  extraActions?: ReactNode;
  onPrint?: () => void;
};

export function ReportPrintActions({
  clientName,
  title,
  description,
  printLabel = "Print Report",
  backHref,
  backLabel = BACK_TO_CLIENT_WORKSPACE_OVERVIEW,
  extraActions,
  onPrint,
}: ReportPrintActionsProps) {
  function handlePrint() {
    if (onPrint) {
      onPrint();
      return;
    }
    window.print();
  }

  return (
    <div className="report-no-print flex min-w-0 max-w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="page-header min-w-0 flex-1">
        {clientName ? <p className="text-sm text-muted-foreground">{clientName}</p> : null}
        <h2 className="page-title">{title}</h2>
        {description ? <p className="page-description">{description}</p> : null}
      </div>
      <div className="action-bar">
        {extraActions}
        <button
          type="button"
          onClick={handlePrint}
          className={buttonClassName({ variant: "outline", className: "w-full sm:w-auto" })}
        >
          <Printer className="mr-2 h-4 w-4" />
          {printLabel}
        </button>
        {backHref ? (
          <Link
            href={backHref}
            className={buttonClassName({ variant: "ghost", className: "w-full sm:w-auto" })}
          >
            {backLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
