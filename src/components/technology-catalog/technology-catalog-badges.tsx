import { Badge } from "@/components/ui/badge";
import {
  formatLifecycleStatus,
  formatStandardStatus,
  standardStatusLabel,
} from "@/lib/technology-catalog/labels";
import type { TechnologyLifecycleStatus, TechnologyStandardStatus } from "@/lib/technology-catalog/types";
import { cn } from "@/lib/utils";

export function TechnologyStandardBadge({
  status,
  className,
}: {
  status: TechnologyStandardStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-accent-blue/40 bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/10",
        status === "preferred" && "border-accent-blue/50 bg-accent-blue/15 font-medium",
        className,
      )}
    >
      {standardStatusLabel(status)}
    </Badge>
  );
}

export function TechnologyLifecycleBadge({
  status,
  className,
}: {
  status: TechnologyLifecycleStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-border bg-muted/40 text-secondary-token",
        status === "current" && "border-success/30 bg-success/10 text-success",
        className,
      )}
    >
      {formatLifecycleStatus(status)}
    </Badge>
  );
}

export function TechnologyMetaGrid({
  vendor,
  category,
  lifecycle,
  standard,
}: {
  vendor: string;
  category: string;
  lifecycle: TechnologyLifecycleStatus;
  standard: TechnologyStandardStatus;
}) {
  const rows = [
    { label: "Vendor", value: vendor },
    { label: "Category", value: category },
    { label: "Lifecycle", value: formatLifecycleStatus(lifecycle) },
    { label: "Standard", value: formatStandardStatus(standard) },
  ];

  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {rows.map((row) => (
        <div key={row.label} className="min-w-0 rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{row.label}</dt>
          <dd className="mt-1 text-sm font-medium text-foreground">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
