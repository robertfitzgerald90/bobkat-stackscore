import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  instrumentScorePanelFixture,
  type InstrumentSeverity,
} from "./instrument-score-panel-data";
import { InstrumentScoreReadout } from "./instrument-score-readout";

/**
 * Phase 1 proof-of-concept: the production `AssessmentScorePanel`
 * (src/components/assessments/assessment-score-panel.tsx) rebuilt on the
 * "Instrument" tokens, using the same information architecture — overall
 * score, projected score, pillar breakdown, top risks — with static
 * fictional data. The production component is untouched.
 */

const SEVERITY_BADGE_VARIANT: Record<InstrumentSeverity, "success" | "warning" | "destructive"> = {
  measured: "success",
  caution: "warning",
  critical: "destructive",
};

const SEVERITY_BAR_CLASS: Record<InstrumentSeverity, string> = {
  measured: "bg-success",
  caution: "bg-warning",
  critical: "bg-destructive",
};

const SEVERITY_TEXT_CLASS: Record<InstrumentSeverity, string> = {
  measured: "text-success",
  caution: "text-warning",
  critical: "text-destructive",
};

const SEVERITY_LABEL: Record<InstrumentSeverity, string> = {
  measured: "Measured",
  caution: "Caution",
  critical: "Critical",
};

export function InstrumentScorePanel() {
  const data = instrumentScorePanelFixture;

  return (
    <Card className="max-w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="instrument-mono text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Live Reading
          </CardTitle>
          <Badge variant="outline" className="instrument-mono text-[10px] uppercase tracking-wide">
            {data.answeredCount}/{data.totalCount} answered
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="text-center">
          <p className="instrument-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Overall StackScore
          </p>
          <p
            className={cn(
              "text-6xl font-semibold",
              SEVERITY_TEXT_CLASS[data.overallSeverity],
            )}
          >
            <InstrumentScoreReadout value={data.overallScore} />
          </p>
          <Badge variant={SEVERITY_BADGE_VARIANT[data.overallSeverity]} className="mt-2">
            {data.overallLabel}
          </Badge>
        </div>

        <div className="flex items-center justify-between border border-primary/30 bg-primary/[0.08] px-3 py-2">
          <span className="text-sm text-muted-foreground">Projected if addressed</span>
          <span className="instrument-mono text-lg font-semibold text-primary">
            {data.projectedScore}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="border border-border px-3 py-2 text-center">
            <p className="instrument-mono text-2xl font-semibold text-destructive">
              {data.criticalFindingsCount}
            </p>
            <p className="text-xs text-muted-foreground">Critical Findings</p>
          </div>
          <div className="border border-border px-3 py-2 text-center">
            <p className="instrument-mono text-2xl font-semibold text-foreground">
              {data.openRecommendationsCount}
            </p>
            <p className="text-xs text-muted-foreground">Open Recommendations</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Technology Pillars</p>
          {data.pillars.map((pillar) => (
            <div key={pillar.id} className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="min-w-0 truncate text-foreground">{pillar.name}</span>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={SEVERITY_BADGE_VARIANT[pillar.severity]} className="text-[10px]">
                    {SEVERITY_LABEL[pillar.severity]}
                  </Badge>
                  <span className="instrument-mono font-medium text-foreground">
                    {pillar.score}
                  </span>
                </div>
              </div>
              <div className="h-1.5 overflow-hidden bg-muted">
                <div
                  className={cn("h-full transition-none", SEVERITY_BAR_CLASS[pillar.severity])}
                  style={{ width: `${pillar.score}%` }}
                />
              </div>
              <p className="instrument-mono text-[11px] text-muted-foreground">
                {pillar.answered}/{pillar.total} answered
              </p>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Top Current Risks</p>
          <ul className="space-y-2">
            {data.topRisks.map((risk) => (
              <li
                key={risk.id}
                className="flex items-center justify-between gap-2 border border-border p-2 text-sm"
              >
                <span className="min-w-0 truncate text-foreground">{risk.label}</span>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={SEVERITY_BADGE_VARIANT[risk.severity]} className="text-[10px]">
                    {SEVERITY_LABEL[risk.severity]}
                  </Badge>
                  <span className="instrument-mono font-medium text-foreground">{risk.score}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
