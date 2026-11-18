import Link from "next/link";
import { ArrowUpRight, ChartNoAxesCombined } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CommandCenterSummary } from "@/lib/dashboard/command-center-types";
import {
  MATURITY_CATEGORY_ORDER,
  RATING_DISPLAY_LABELS,
} from "@/lib/scoring/rating-display";
import { formatMaturityScore } from "@/lib/scoring/score-display";

const COLORS = {
  critical: "var(--destructive)",
  at_risk: "var(--warning)",
  stable: "var(--primary)",
  strong: "color-mix(in srgb, var(--primary) 65%, var(--foreground))",
  exceptional: "color-mix(in srgb, var(--primary) 35%, var(--foreground))",
};

/** Official maturity and assessment records, not inferred progress or historical trends. */
export function PortfolioHealth({
  summary,
}: {
  summary: CommandCenterSummary;
}) {
  const total = MATURITY_CATEGORY_ORDER.reduce(
    (sum, rating) => sum + summary.scoreDistribution[rating],
    0,
  );
  const assessments =
    summary.pulse.activeAssessments + summary.pulse.completedAssessments;
  const circumference = 2 * Math.PI * 72;
  let offset = 0;
  return (
    <Card className="stat-card h-full overflow-hidden">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <ChartNoAxesCombined className="h-4 w-4 text-primary" aria-hidden />
          Portfolio Health
        </CardTitle>
        <Link
          href={summary.role === "admin" ? "/portfolio" : "/clients"}
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Explore clients <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid items-center gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="relative mx-auto h-52 w-52 max-w-full">
            <svg
              viewBox="0 0 180 180"
              className="h-full w-full -rotate-90"
              role="img"
              aria-label={`Maturity distribution for ${total} assessed clients. Average official StackScore ${formatMaturityScore(summary.dashboard.kpis.averageStackScore)} out of 100.`}
            >
              <circle
                cx="90"
                cy="90"
                r="72"
                fill="none"
                stroke="var(--muted)"
                strokeWidth="15"
              />
              {MATURITY_CATEGORY_ORDER.map((rating) => {
                const length = total
                  ? (summary.scoreDistribution[rating] / total) * circumference
                  : 0;
                const start = offset;
                offset += length;
                return length > 0 ? (
                  <circle
                    key={rating}
                    cx="90"
                    cy="90"
                    r="72"
                    fill="none"
                    stroke={COLORS[rating]}
                    strokeWidth="15"
                    strokeDasharray={`${length} ${circumference - length}`}
                    strokeDashoffset={-start}
                  >
                    <title>
                      {`${RATING_DISPLAY_LABELS[rating]}: ${summary.scoreDistribution[rating]} client${summary.scoreDistribution[rating] === 1 ? "" : "s"}`}
                    </title>
                  </circle>
                ) : null;
              })}
            </svg>
            <div
              className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
              aria-hidden
            >
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Average score
              </span>
              <span className="mt-1 text-4xl font-bold tabular-nums">
                {formatMaturityScore(summary.dashboard.kpis.averageStackScore)}
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                {total ? "Official · out of 100" : "No assessed clients"}
              </span>
            </div>
          </div>
          <ul className="space-y-3" aria-label="Client maturity categories">
            {MATURITY_CATEGORY_ORDER.map((rating) => (
              <li key={rating} className="flex items-center gap-2.5 text-xs">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: COLORS[rating] }}
                  aria-hidden
                />
                <span className="flex-1 text-muted-foreground">
                  {RATING_DISPLAY_LABELS[rating]}
                </span>
                <span className="font-semibold tabular-nums">
                  {summary.scoreDistribution[rating]}
                </span>
                <span className="w-9 text-right tabular-nums text-muted-foreground">
                  {total
                    ? `${Math.round((summary.scoreDistribution[rating] / total) * 100)}%`
                    : "—"}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t border-border/60 pt-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-semibold">Assessment Workload</h3>
            <span className="text-xs text-muted-foreground">
              {assessments} total assessments
            </span>
          </div>
          <div
            className="flex h-2.5 overflow-hidden rounded-full bg-muted"
            aria-hidden
          >
            <div
              className="h-full bg-primary"
              style={{
                width: `${assessments ? (summary.pulse.completedAssessments / assessments) * 100 : 0}%`,
              }}
            />
            <div
              className="h-full bg-primary/30"
              style={{
                width: `${assessments ? (summary.pulse.activeAssessments / assessments) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
            <span>
              <span
                className="mr-1.5 inline-block h-2 w-2 rounded-full bg-primary"
                aria-hidden
              />
              {summary.pulse.completedAssessments} completed
            </span>
            <span>
              <span
                className="mr-1.5 inline-block h-2 w-2 rounded-full bg-primary/30"
                aria-hidden
              />
              {summary.pulse.activeAssessments} in progress
            </span>
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
            Scores reflect completed assessments. Project completion tracks
            delivery; it does not change official maturity scores.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
