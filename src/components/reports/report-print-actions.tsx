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
    <div className="report-no-print report-toolbar-legacy flex w-full max-w-full flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-[12rem] flex-1 basis-0">
        {clientName ? <p className="text-sm text-muted-foreground">{clientName}</p> : null}
        <h2 className="text-xl font-semibold tracking-tight text-primary sm:text-2xl">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
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
