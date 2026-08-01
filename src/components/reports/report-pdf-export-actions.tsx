"use client";

import type { ReactNode } from "react";
import { useRef, useState } from "react";
import Link from "next/link";
import { FileDown } from "lucide-react";
import { buttonClassName } from "@/components/ui/button";
import { BACK_TO_CLIENT_WORKSPACE_OVERVIEW } from "@/lib/technology-maturity/labels";
import { toast } from "sonner";

type ReportPdfExportActionsProps = {
  clientId: string;
  qbrId: string;
  clientName?: string;
  title: string;
  description?: string;
  exportLabel?: string;
  loadingLabel?: string;
  backHref?: string;
  backLabel?: string;
  extraActions?: ReactNode;
};

function filenameFromContentDisposition(header: string | null): string | null {
  if (!header) return null;
  const utfMatch = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1]);
    } catch {
      return utfMatch[1];
    }
  }
  const plainMatch = header.match(/filename="?([^";]+)"?/i);
  return plainMatch?.[1] ?? null;
}

export function ReportPdfExportActions({
  clientId,
  qbrId,
  clientName,
  title,
  description,
  exportLabel = "Export PDF",
  loadingLabel = "Generating PDF…",
  backHref,
  backLabel = BACK_TO_CLIENT_WORKSPACE_OVERVIEW,
  extraActions,
}: ReportPdfExportActionsProps) {
  const [exporting, setExporting] = useState(false);
  const inFlightRef = useRef(false);

  async function handleExport() {
    if (exporting || inFlightRef.current) return;
    inFlightRef.current = true;
    setExporting(true);

    try {
      const response = await fetch(`/api/v1/clients/${clientId}/qbr/${qbrId}/pdf`, {
        method: "GET",
        headers: { Accept: "application/pdf" },
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        toast.error(
          payload.error ?? "Unable to generate the Business Review PDF. No file was downloaded.",
        );
        return;
      }

      const blob = await response.blob();
      if (!blob.size || blob.type.includes("json")) {
        toast.error("Unable to generate the Business Review PDF. No file was downloaded.");
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download =
        filenameFromContentDisposition(response.headers.get("Content-Disposition")) ??
        "Business-Review.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);

      toast.success("Business Review PDF exported.");
    } catch {
      toast.error("Unable to generate the Business Review PDF. No file was downloaded.");
    } finally {
      setExporting(false);
      inFlightRef.current = false;
    }
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
          onClick={() => void handleExport()}
          disabled={exporting}
          title="Download a polished PDF version of this Business Review."
          aria-label={exporting ? loadingLabel : exportLabel}
          aria-busy={exporting}
          className={buttonClassName({ variant: "outline", className: "w-full sm:w-auto" })}
        >
          <FileDown className="mr-2 h-4 w-4" aria-hidden />
          {exporting ? loadingLabel : exportLabel}
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
