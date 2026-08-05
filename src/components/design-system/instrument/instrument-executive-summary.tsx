import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { instrumentScorePanelFixture } from "./instrument-score-panel-data";
import { InstrumentScoreReadout } from "./instrument-score-readout";

/**
 * Fictional Executive Summary "reading" for the Phase 2 preview — the kind
 * of report surface that should carry four-corner brackets, since it is
 * presenting a measured result rather than static chrome.
 */
export function InstrumentExecutiveSummary() {
  const data = instrumentScorePanelFixture;

  return (
    <Card className="max-w-full">
      <CardHeader className="pb-2">
        <CardTitle className="instrument-mono text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Executive Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-foreground">
          Overall technology maturity is <span className="text-primary">stable</span> at{" "}
          <span className="instrument-mono font-semibold text-primary">{data.overallScore}</span>,
          up from a prior reading of{" "}
          <span className="instrument-mono font-semibold text-foreground">57</span>. Backup and
          recovery remains the primary exposure and should be prioritized this cycle.
        </p>
        <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
          <div>
            <p className="text-2xl font-semibold text-primary">
              <InstrumentScoreReadout value={data.overallScore} />
            </p>
            <p className="text-[11px] text-muted-foreground">Current Reading</p>
          </div>
          <div>
            <p className="instrument-mono text-2xl font-semibold text-foreground">+14</p>
            <p className="text-[11px] text-muted-foreground">Since Prior Review</p>
          </div>
          <div>
            <p className="instrument-mono text-2xl font-semibold text-destructive">
              {data.criticalFindingsCount}
            </p>
            <p className="text-[11px] text-muted-foreground">Critical Findings</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
