"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useIsClient } from "@/hooks/use-is-client";
import type { TimeSeries } from "@/lib/admin-analytics/types";

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

export function AnalyticsTimeChart({ series }: { series: TimeSeries }) {
  const isClient = useIsClient();
  if (series.availability !== "available") {
    return (
      <p className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">
        {series.availability === "not_connected"
          ? "Not connected."
          : series.availability === "not_tracked"
            ? "Not tracked."
            : "Unavailable."}{" "}
        {series.note}
      </p>
    );
  }

  const hasActivity = series.points.some((point) =>
    series.series.some((item) => (point.values[item.key] ?? 0) > 0),
  );
  if (!hasActivity) {
    return (
      <p className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">
        No recorded activity in this range.
      </p>
    );
  }

  if (!isClient) {
    return <div className="h-72 w-full animate-pulse rounded-md bg-muted/30" aria-hidden />;
  }

  const data = series.points.map((point) => ({
    date: point.date.slice(5),
    ...point.values,
  }));

  return (
    <div className="h-72 min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={36} />
          <Tooltip />
          <Legend />
          {series.series.map((item, index) => (
            <Line
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.label}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
