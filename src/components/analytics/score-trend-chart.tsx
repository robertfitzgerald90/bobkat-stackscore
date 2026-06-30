"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useIsClient } from "@/hooks/use-is-client";
import type { ScoreTrendPoint } from "@/lib/analytics/types";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";

type ScoreTrendChartProps = {
  data: ScoreTrendPoint[];
};

export function ScoreTrendChart({ data }: ScoreTrendChartProps) {
  const isClient = useIsClient();

  if (data.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        Complete an assessment to begin tracking score trends.
      </p>
    );
  }

  if (!isClient) {
    return <div className="h-72 w-full animate-pulse rounded-md bg-muted/30" aria-hidden />;
  }

  const chartData = data.map((point) => ({
    label: point.dateLabel,
    score: point.overallScore,
    name: point.assessmentName ?? point.dateLabel,
  }));

  return (
    <div className="h-72 min-w-0 w-full max-w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
            interval="preserveStartEnd"
          />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} className="text-muted-foreground" />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const item = payload[0].payload as { name: string; score: number; label: string };
              return (
                <div className="rounded-lg border bg-card px-3 py-2 text-sm shadow-md">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-muted-foreground">{item.label}</p>
                  <p className={getScoreTextColorClass(item.score)}>
                    StackScore: <span className="font-semibold">{item.score}</span>
                  </p>
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="var(--chart-1)"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "var(--chart-1)" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
