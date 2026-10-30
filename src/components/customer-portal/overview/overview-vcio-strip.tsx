import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ClientStatusBadge } from "@/components/client-ui";
import { buttonClassName } from "@/components/ui/button";
import { CLIENT_SURFACE_CARD } from "@/lib/client-ui/tokens";
import type { CustomerOverviewVcioSummary } from "@/lib/customer-portal/overview";
import { cn } from "@/lib/utils";

type OverviewVcioStripProps = {
  vcio: CustomerOverviewVcioSummary;
};

function accessTone(
  state: CustomerOverviewVcioSummary["accessState"],
): "success" | "warning" | "muted" | "danger" {
  if (state === "FULL_ACCESS") return "success";
  if (state === "GRACE_PERIOD") return "warning";
  if (state === "REQUIRES_PAYMENT_ACTION") return "danger";
  return "muted";
}

function accessLabel(state: CustomerOverviewVcioSummary["accessState"]): string {
  switch (state) {
    case "FULL_ACCESS":
      return "Active";
    case "GRACE_PERIOD":
      return "Grace period";
    case "REQUIRES_PAYMENT_ACTION":
      return "Payment required";
    case "READ_ONLY":
      return "Read-only";
    default:
      return "Unavailable";
  }
}

/** Compact engagement strip — not a second dashboard. */
export function OverviewVcioStrip({ vcio }: OverviewVcioStripProps) {
  if (!vcio.show) return null;

  return (
    <section
      className={cn(
        CLIENT_SURFACE_CARD,
        "flex flex-col gap-4 rounded-sm border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5",
      )}
      aria-label="vCIO engagement summary"
    >
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{vcio.title}</p>
          <ClientStatusBadge tone={accessTone(vcio.accessState)}>
            {accessLabel(vcio.accessState)}
          </ClientStatusBadge>
        </div>
        <p className="text-sm text-muted-foreground">{vcio.description}</p>
      </div>
      <Link href={vcio.href} className={buttonClassName({ variant: "outline", size: "sm" })}>
        Open vCIO Dashboard
        <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden />
      </Link>
    </section>
  );
}
