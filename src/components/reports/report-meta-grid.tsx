import type { ReactNode } from "react";
import { BRAND } from "@/lib/branding";
import type { ReportMetaItem } from "@/lib/reports/types";
import { cn } from "@/lib/utils";

type ReportMetaGridProps = {
  items: ReportMetaItem[];
  className?: string;
  bordered?: boolean;
};

export function ReportMetaGrid({ items, className, bordered = true }: ReportMetaGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
        bordered && "border-b pb-6",
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label}>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
          <div
            className={cn(
              "mt-1 font-semibold",
              item.emphasis && "text-2xl font-bold",
              item.valueClassName,
            )}
          >
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReportClientHeader({
  clientName,
  metaItems,
  className,
}: {
  clientName: string;
  metaItems: Array<{ label: string; value: ReactNode }>;
  className?: string;
}) {
  return (
    <div className={cn("border-b pb-6", className)}>
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
        Prepared by {BRAND.companyName}
      </p>
      <p className="mt-4 text-2xl font-bold text-primary">{clientName}</p>
      <div className="mt-4 flex flex-wrap gap-6 text-sm">
        {metaItems.map((item) => (
          <div key={item.label}>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
            <p className="font-semibold">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
