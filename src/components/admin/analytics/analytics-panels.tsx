import { ExecutiveKpiCard } from "@/components/executive-os/executive-kpi-card";
import {
  availabilityLabel,
  formatCount,
  formatMoneyFromCents,
  formatRate,
  formatRefreshedAt,
  periodComparison,
} from "@/lib/admin-analytics/format";
import type { BreakdownTable, CountMetric, RateMetric } from "@/lib/admin-analytics/types";
import { MobileDataCard, MobileDataRow } from "@/components/ui/mobile-data-card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function refreshedLine(source: string, refreshedAt: string): string {
  return `${source} · Updated ${formatRefreshedAt(refreshedAt)}`;
}

export function MetricTile({
  metric,
  sparkline,
}: {
  metric: CountMetric;
  sparkline?: number[];
}) {
  const available = metric.availability === "available" && metric.value != null;
  const value = available
    ? metric.unit === "currency_cents"
      ? formatMoneyFromCents(metric.value as number, metric.currency)
      : formatCount(metric.value as number)
    : availabilityLabel(metric.availability);
  const comparison =
    available && metric.previousValue != null
      ? periodComparison(metric.value as number, metric.previousValue)
      : null;

  return (
    <div className="min-w-0">
      <ExecutiveKpiCard
        label={metric.label}
        value={value}
        emphasizeClassName={available ? undefined : "text-xl font-medium text-muted-foreground sm:text-2xl"}
        description={[metric.definition, metric.note].filter(Boolean).join(" ")}
        sublabel={refreshedLine(metric.source, metric.refreshedAt)}
        trend={comparison?.trend}
        trendLabel={comparison?.label}
        sparkline={available ? sparkline : undefined}
      />
    </div>
  );
}

export function RateTile({ metric }: { metric: RateMetric }) {
  const available = metric.availability === "available" && metric.rate != null;
  return (
    <article className="min-w-0 rounded-xl border bg-card p-4 shadow-sm ring-1 ring-border/60">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {metric.label}
      </p>
      <p className={available ? "mt-3 text-3xl font-semibold" : "mt-3 text-xl font-medium text-muted-foreground"}>
        {available ? formatRate(metric.rate as number) : availabilityLabel(metric.availability)}
      </p>
      {available && metric.numerator != null && metric.denominator != null ? (
        <p className="mt-2 text-sm text-muted-foreground">
          {formatCount(metric.numerator)} of {formatCount(metric.denominator)}
        </p>
      ) : null}
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {[metric.definition, metric.note].filter(Boolean).join(" ")}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">{refreshedLine(metric.source, metric.refreshedAt)}</p>
    </article>
  );
}

export function BreakdownPanel({ table }: { table: BreakdownTable }) {
  const total = table.rows.reduce((sum, row) => sum + row.value, 0);
  return (
    <section className="min-w-0 rounded-xl border bg-card shadow-sm ring-1 ring-border/60">
      <div className="space-y-2 border-b px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold">{table.title}</h2>
          {table.availability !== "available" ? (
            <Badge variant="outline">{availabilityLabel(table.availability)}</Badge>
          ) : null}
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{table.definition}</p>
        <p className="text-xs text-muted-foreground">{refreshedLine(table.source, table.refreshedAt)}</p>
        {table.note ? <p className="text-sm text-muted-foreground">{table.note}</p> : null}
      </div>
      {table.availability !== "available" ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">
          {availabilityLabel(table.availability)}. This table is not filled with zeros.
        </p>
      ) : table.rows.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">No rows in this range.</p>
      ) : (
        <>
          <div className="table-desktop px-2 pb-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">{table.valueLabel}</TableHead>
                  <TableHead className="text-right">Share of listed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {table.rows.map((row) => (
                  <TableRow key={row.label}>
                    <TableCell className="max-w-[28rem] break-words font-medium">{row.label}</TableCell>
                    <TableCell className="text-right">{formatCount(row.value)}</TableCell>
                    <TableCell className="text-right">
                      {total > 0 ? formatRate(row.value / total) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="table-mobile p-3">
            {table.rows.map((row) => (
              <MobileDataCard key={row.label}>
                <p className="break-words font-medium">{row.label}</p>
                <MobileDataRow label={table.valueLabel}>{formatCount(row.value)}</MobileDataRow>
                <MobileDataRow label="Share of listed">
                  {total > 0 ? formatRate(row.value / total) : "—"}
                </MobileDataRow>
              </MobileDataCard>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
