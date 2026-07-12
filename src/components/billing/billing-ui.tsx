"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_VARIANT } from "@/lib/billing/labels";
import { formatMoney } from "@/lib/billing/money";
import type { InvoiceStatus } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <Badge variant={INVOICE_STATUS_VARIANT[status]}>{INVOICE_STATUS_LABELS[status]}</Badge>
  );
}

export function BillingMetricCard({
  label,
  value,
  highlight = false,
  className,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <Card className={cn(highlight && "border-primary/30 bg-primary/5", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={cn("text-2xl font-bold tabular-nums", highlight && "text-primary")}>{value}</p>
      </CardContent>
    </Card>
  );
}

export function BillingAttentionList({
  title,
  items,
  emptyMessage,
  hrefBuilder,
}: {
  title: string;
  items: Array<{ id: string; label: string; meta?: string }>;
  emptyMessage: string;
  hrefBuilder?: (id: string) => string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-2 text-sm">
                {hrefBuilder ? (
                  <Link href={hrefBuilder(item.id)} className="font-medium text-primary hover:underline">
                    {item.label}
                  </Link>
                ) : (
                  <span className="font-medium">{item.label}</span>
                )}
                {item.meta ? <span className="text-muted-foreground">{item.meta}</span> : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function formatBillingMoney(cents: number) {
  return formatMoney(cents);
}
