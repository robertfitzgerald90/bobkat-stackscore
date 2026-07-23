import { AlertTriangle, CheckCircle2, Minus } from "lucide-react";
import type { ExecutiveBriefingModel } from "@/lib/executive-os/briefing";
import { EXECUTIVE_OS_BRIEFING_PANEL, EXECUTIVE_OS_SCORE_RING } from "@/lib/executive-os/tokens";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import { cn } from "@/lib/utils";

type ExecutiveBriefingPanelProps = {
  briefing: ExecutiveBriefingModel;
};

function ChangeIcon({ tone }: { tone: ExecutiveBriefingModel["changes"][number]["tone"] }) {
  if (tone === "positive") {
    return <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />;
  }
  if (tone === "attention") {
    return <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />;
  }
  return <Minus className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />;
}

export function ExecutiveBriefingPanel({ briefing }: ExecutiveBriefingPanelProps) {
  const scoreClass =
    briefing.overallHealthScore !== null
      ? getScoreTextColorClass(briefing.overallHealthScore)
      : undefined;

  return (
    <section className={EXECUTIVE_OS_BRIEFING_PANEL} aria-labelledby="executive-briefing-heading">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start">
        <div className="min-w-0 space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Executive Briefing
            </p>
            <h1 id="executive-briefing-heading" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              {briefing.greeting}, {briefing.welcomeName}.
            </h1>
            <p className="mt-2 text-base text-muted-foreground">{briefing.headline}</p>
          </div>

          {briefing.changes.length > 0 ? (
            <ul className="space-y-2.5" aria-label="Changes since last review">
              {briefing.changes.map((item) => (
                <li key={item.message} className="flex items-start gap-2.5 text-sm leading-relaxed">
                  <ChangeIcon tone={item.tone} />
                  <span className="text-foreground">{item.message}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {briefing.maturityTrend || briefing.riskTrend ? (
            <div className="space-y-1 text-sm text-muted-foreground">
              {briefing.maturityTrend ? <p>{briefing.maturityTrend}</p> : null}
              {briefing.riskTrend ? <p>{briefing.riskTrend}</p> : null}
            </div>
          ) : null}
        </div>

        <div className="space-y-5">
          <div className={EXECUTIVE_OS_SCORE_RING}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Overall Technology Health
            </p>
            <p className={cn("mt-3 text-5xl font-semibold tabular-nums tracking-tight", scoreClass)}>
              {briefing.overallHealthScore ?? "—"}
              {briefing.overallHealthScore !== null ? (
                <span className="text-2xl font-normal text-muted-foreground">
                  {" "}
                  / {briefing.overallHealthMax}
                </span>
              ) : null}
            </p>
          </div>

          {briefing.recommendedAction ? (
            <div className="rounded-xl border border-primary/20 bg-primary/[0.06] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Recommended next action
              </p>
              <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                {briefing.recommendedAction.title}
              </p>
              <dl className="mt-4 grid gap-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Estimated business impact</dt>
                  <dd className="font-medium text-foreground">{briefing.recommendedAction.businessImpact}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Estimated implementation effort</dt>
                  <dd className="font-medium text-foreground">{briefing.recommendedAction.effort}</dd>
                </div>
              </dl>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
