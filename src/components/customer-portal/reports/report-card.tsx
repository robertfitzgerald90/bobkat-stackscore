import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { ClientStatusBadge } from "@/components/client-ui";
import { buttonClassName } from "@/components/ui/button";
import { CLIENT_SURFACE_CARD } from "@/lib/client-ui/tokens";
import type { CustomerReportCard } from "@/lib/customer-portal/reports-dto";
import { cn } from "@/lib/utils";

type ReportCardProps = {
  card: CustomerReportCard;
};

export function ReportCard({ card }: ReportCardProps) {
  return (
    <article
      className={cn(
        CLIENT_SURFACE_CARD,
        "flex h-full min-w-0 flex-col rounded-sm border bg-card p-4 sm:p-5",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <ClientStatusBadge tone="default">{card.typeLabel}</ClientStatusBadge>
      </div>
      <h3 className="mt-3 text-base font-semibold leading-snug text-foreground">{card.title}</h3>
      <dl className="mt-3 space-y-1.5 text-sm">
        <div className="flex flex-wrap gap-x-2">
          <dt className="text-muted-foreground">Company</dt>
          <dd className="min-w-0 break-words text-foreground">{card.companyName}</dd>
        </div>
        {card.periodLabel ? (
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-muted-foreground">Period</dt>
            <dd className="min-w-0 break-words text-foreground">{card.periodLabel}</dd>
          </div>
        ) : null}
        {card.completedAtLabel ? (
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-muted-foreground">Completed</dt>
            <dd className="text-foreground">{card.completedAtLabel}</dd>
          </div>
        ) : null}
      </dl>
      <div className="mt-auto flex flex-col gap-2 pt-4 sm:flex-row sm:flex-wrap">
        {card.actions.map((action) =>
          action.download ? (
            <a
              key={action.id}
              href={action.href}
              className={buttonClassName({
                variant: "outline",
                size: "sm",
                className: "w-full sm:w-auto",
              })}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              {action.label}
            </a>
          ) : (
            <Link
              key={action.id}
              href={action.href}
              className={buttonClassName({
                variant: action.id === "view" || action.id === "open-review" ? "default" : "outline",
                size: "sm",
                className: "w-full sm:w-auto",
              })}
            >
              <FileText className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              {action.label}
            </Link>
          ),
        )}
      </div>
    </article>
  );
}
