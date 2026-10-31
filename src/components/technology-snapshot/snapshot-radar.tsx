"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import type { SnapshotCategoryFinding } from "@/lib/technology-snapshot/engine";
import { cn } from "@/lib/utils";

type SnapshotRadarProps = {
  categories: SnapshotCategoryFinding[];
  className?: string;
};

/** Brand violet — hex tokens must not be wrapped in hsl(). */
const RADAR_STROKE = "var(--brand-primary, #a855f7)";
const RADAR_FILL = "var(--brand-primary, #a855f7)";
const RADAR_DOT_STROKE = "var(--brand-primary-foreground, #ffffff)";
const GRID_STROKE = "color-mix(in oklab, var(--brand-primary, #a855f7) 22%, transparent)";
const LABEL_FILL = "var(--muted-foreground, #a1a1aa)";

type RadarDotProps = {
  cx?: number;
  cy?: number;
};

function SnapshotRadarVertex({ cx = 0, cy = 0 }: RadarDotProps) {
  return (
    <g>
      {/* Outer halo for contrast on dark charcoal */}
      <circle cx={cx} cy={cy} r={7} fill="rgba(8, 9, 12, 0.85)" />
      <circle
        cx={cx}
        cy={cy}
        r={4.5}
        fill={RADAR_STROKE}
        stroke={RADAR_DOT_STROKE}
        strokeWidth={1.5}
      />
    </g>
  );
}

/**
 * Four-axis indicative Snapshot profile — not the official eight-pillar StackScore radar.
 * Values are normalized category percents (0–100); never inflated for display.
 */
const AXIS_SHORT_LABEL: Record<string, string> = {
  security_access: "Security",
  devices_infrastructure: "Devices",
  data_protection: "Data & Recovery",
  technology_planning: "Planning",
};

export function SnapshotRadar({ categories, className }: SnapshotRadarProps) {
  const data = categories.map((c) => ({
    label: AXIS_SHORT_LABEL[c.id] ?? c.name,
    value: c.percent,
  }));

  const strongest = [...categories].sort((a, b) => b.percent - a.percent)[0];
  const weakest = [...categories].sort((a, b) => a.percent - b.percent)[0];
  const maxPercent = strongest?.percent ?? 0;
  const collapsedProfile = maxPercent <= 5;

  return (
    <div
      className={cn("w-full", className)}
      role="img"
      aria-label={`Indicative Snapshot profile radar. ${categories
        .map((c) => `${c.name}: ${c.percent}%`)
        .join(". ")}. Strongest: ${strongest?.name ?? "n/a"}. Weakest: ${weakest?.name ?? "n/a"}.`}
    >
      <div className="mx-auto h-80 w-full max-w-xl min-w-0 sm:h-[22rem] md:h-[26rem] md:max-w-2xl">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <RadarChart
            data={data}
            cx="50%"
            cy="50%"
            outerRadius="78%"
            margin={{ top: 16, right: 12, left: 12, bottom: 16 }}
          >
            <PolarGrid
              stroke={GRID_STROKE}
              strokeWidth={1}
              gridType="polygon"
              radialLines
            />
            <PolarAngleAxis
              dataKey="label"
              tick={{
                fill: LABEL_FILL,
                fontSize: 12,
                fontWeight: 500,
              }}
              tickLine={false}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Radar
              name="Snapshot profile"
              dataKey="value"
              stroke={RADAR_STROKE}
              strokeWidth={2.75}
              fill={RADAR_FILL}
              fillOpacity={0.38}
              isAnimationActive={false}
              dot={<SnapshotRadarVertex />}
              activeDot={false}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {collapsedProfile ? (
        <p
          className="mt-2 rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-center text-xs text-foreground sm:text-sm"
          role="note"
        >
          Category scores are near zero, so the polygon collapses toward the center. Use the
          percentages below — values are not inflated for display.
        </p>
      ) : null}

      {/* Accessible numeric readout — especially important when scores are near zero */}
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {categories.map((c) => (
          <li
            key={c.id}
            className="rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-2 text-center"
          >
            <p className="text-[11px] font-medium leading-tight text-muted-foreground sm:text-xs">
              {c.name}
            </p>
            <p className="mt-1 text-sm font-semibold tabular-nums text-primary sm:text-base">
              {c.percent}%
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Indicative Snapshot profile (normalized category scores) — not an Official StackScore radar.
      </p>
    </div>
  );
}
