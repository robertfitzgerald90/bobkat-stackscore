"use client";

import Link from "next/link";
import { useIsClient } from "@/hooks/use-is-client";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { ScoreTrendChart } from "@/components/analytics/score-trend-chart";
import { TrendIndicator } from "@/components/analytics/trend-indicator";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScoreTrendPoint } from "@/lib/analytics/types";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import { cn } from "@/lib/utils";

type ClientScoreSummaryProps = {
  clientId: string;
  scoreTrend: ScoreTrendPoint[];
  initialScore: number | null;
  currentScore: number | null;
  netImprovement: number | null;
};

export function ClientScoreSummary({
  clientId,
  scoreTrend,
  initialScore,
  currentScore,
  netImprovement,
}: ClientScoreSummaryProps) {
  const isClient = useIsClient();
  const sparklineData = scoreTrend.map((point) => ({
    score: point.overallScore,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
        <div>
          <CardTitle>Score Trends</CardTitle>
          <CardDescription>Historical StackScore performance</CardDescription>
        </div>
        <Link
          href={`/clients/${clientId}/improvement`}
          className={buttonClassName({ variant: "outline", size: "sm", className: "w-full sm:w-auto" })}
        >
          View Dashboard
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {scoreTrend.length === 0 ? (
          <p className="text-sm text-muted-foreground">No score history yet.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <SummaryStat label="Initial" value={initialScore} />
              <SummaryStat label="Current" value={currentScore} emphasize />
              <div className="rounded-md border border-border/60 bg-muted/15 px-3 py-2">
                <p className="text-xs text-muted-foreground">Net Change</p>
                <div className="mt-1">
                  <TrendIndicator delta={netImprovement} size="md" />
                </div>
              </div>
            </div>

            {isClient && sparklineData.length > 1 ? (
              <div className="h-16 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparklineData}>
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="var(--chart-1)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : sparklineData.length > 1 ? (
              <div className="h-16 w-full animate-pulse rounded-md bg-muted/30" aria-hidden />
            ) : null}

            {isClient && scoreTrend.length > 1 ? (
              <ScoreTrendChart data={scoreTrend} />
            ) : scoreTrend.length > 1 ? (
              <div className="h-72 w-full animate-pulse rounded-md bg-muted/30" aria-hidden />
            ) : (
              <p className="text-sm text-muted-foreground">
                Complete another assessment to visualize score movement over time.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function SummaryStat({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: number | null;
  emphasize?: boolean;
}) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/15 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 font-semibold tabular-nums",
          emphasize ? "text-2xl" : "text-lg",
          getScoreTextColorClass(value),
        )}
      >
        {value ?? "—"}
      </p>
    </div>
  );
}
