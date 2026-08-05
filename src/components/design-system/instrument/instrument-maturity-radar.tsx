"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { instrumentScorePanelFixture } from "./instrument-score-panel-data";

/**
 * Fictional maturity radar for the Phase 2 "Instrument" preview. Same six
 * pillars as the score panel fixture, rendered as a reading rather than a
 * decorative chart — phosphor stroke/fill, hairline grid.
 */
export function InstrumentMaturityRadar() {
  const data = instrumentScorePanelFixture.pillars.map((pillar) => ({
    pillar: pillar.name,
    score: pillar.score,
  }));

  return (
    <div className="h-72 w-full min-w-0 max-w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <RadarChart data={data} margin={{ top: 8, right: 16, left: 16, bottom: 8 }}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis
            dataKey="pillar"
            tick={{ fill: "var(--ash)", fontSize: 11 }}
          />
          <Radar
            dataKey="score"
            stroke="var(--phosphor)"
            strokeWidth={1.5}
            fill="var(--phosphor)"
            fillOpacity={0.16}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
