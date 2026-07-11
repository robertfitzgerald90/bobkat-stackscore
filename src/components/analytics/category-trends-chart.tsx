"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { useIsClient } from "@/hooks/use-is-client";
import type { CategoryTrendSeries } from "@/lib/analytics/types";
import { cn } from "@/lib/utils";

const CATEGORY_COLORS = [
  "var(--chart-1)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-2)",
  "var(--chart-5)",
  "var(--text-secondary)",
  "var(--muted-foreground)",
];

type CategoryTrendsChartProps = {
  series: CategoryTrendSeries[];
};

export function CategoryTrendsChart({ series }: CategoryTrendsChartProps) {
  const isClient = useIsClient();
  const availableSeries = series.filter((item) =>
    item.points.some((point) => point.score !== null),
  );
  const [activeCodes, setActiveCodes] = useState<string[]>(
    availableSeries.slice(0, 4).map((item) => item.categoryCode),
  );

  const chartData = useMemo(() => {
    if (availableSeries.length === 0) return [];

    const dateMap = new Map<string, Record<string, string | number | null>>();

    for (const category of availableSeries) {
      for (const point of category.points) {
        const existing = dateMap.get(point.date) ?? { label: point.dateLabel };
        existing[category.categoryCode] = point.score;
        dateMap.set(point.date, existing);
      }
    }

    return Array.from(dateMap.entries())
      .sort(([left], [right]) => new Date(left).getTime() - new Date(right).getTime())
      .map(([, value]) => value);
  }, [availableSeries]);

  if (availableSeries.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        Category score trends appear after completed assessments record history.
      </p>
    );
  }

  function toggleCategory(code: string) {
    setActiveCodes((current) =>
      current.includes(code) ? current.filter((item) => item !== code) : [...current, code],
    );
  }

  if (!isClient) {
    return <div className="h-80 w-full animate-pulse rounded-md bg-muted/30" aria-hidden />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {availableSeries.map((category, index) => {
          const active = activeCodes.includes(category.categoryCode);
          return (
            <Button
              key={category.categoryCode}
              type="button"
              size="sm"
              variant={active ? "default" : "outline"}
              onClick={() => toggleCategory(category.categoryCode)}
              className={cn(!active && "text-muted-foreground")}
              style={
                active
                  ? { borderColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }
                  : undefined
              }
            >
              <span
                className="mr-2 inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
              />
              {category.categoryName}
            </Button>
          );
        })}
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-lg border bg-card px-3 py-2 text-sm shadow-md">
                    <p className="mb-1 font-medium">{label}</p>
                    {payload.map((entry) => {
                      const key = String(entry.dataKey ?? entry.name ?? "category");
                      return (
                        <p key={key} className="text-muted-foreground">
                          {availableSeries.find((item) => item.categoryCode === key)
                            ?.categoryName ?? key}
                          : <span className="font-semibold text-foreground">{entry.value}</span>
                        </p>
                      );
                    })}
                  </div>
                );
              }}
            />
            {availableSeries.map((category, index) =>
              activeCodes.includes(category.categoryCode) ? (
                <Line
                  key={category.categoryCode}
                  type="monotone"
                  dataKey={category.categoryCode}
                  stroke={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
              ) : null,
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
