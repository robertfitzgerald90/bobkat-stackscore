import { ClientSectionHeader, ClientStatusBadge } from "@/components/client-ui";
import { CLIENT_METRIC_VALUE, CLIENT_SURFACE_CARD } from "@/lib/client-ui/tokens";
import { MEANINGFUL_STRENGTH_MIN_PERCENT } from "@/lib/assessments/customer-trust";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import type {
  CustomerOverviewPillar,
  CustomerOverviewStrength,
} from "@/lib/customer-portal/overview";
import { cn } from "@/lib/utils";

type OverviewStrengthsExposureProps = {
  demonstratedStrengths: CustomerOverviewStrength[];
  comparativeStrengths: CustomerOverviewStrength[];
  pillars: CustomerOverviewPillar[];
};

export function OverviewStrengthsExposure({
  demonstratedStrengths,
  comparativeStrengths,
  pillars,
}: OverviewStrengthsExposureProps) {
  const exposures = [...pillars]
    .filter((p): p is CustomerOverviewPillar & { score: number } => p.score !== null)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  const showDemonstrated = demonstratedStrengths.length > 0;
  const showComparative = !showDemonstrated && comparativeStrengths.length > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-4" aria-labelledby="overview-strengths-heading">
        <ClientSectionHeader
          title={showDemonstrated ? "Demonstrated strengths" : "Relative performance"}
          description={
            showDemonstrated
              ? `Pillars at Developing (${MEANINGFUL_STRENGTH_MIN_PERCENT}+) or higher — evidence-based maturity, not relative ranking alone.`
              : "No pillars currently meet the demonstrated strength threshold. These are comparatively higher scores only — not demonstrated maturity."
          }
        />
        <h2 id="overview-strengths-heading" className="sr-only">
          Strengths
        </h2>
        {showDemonstrated ? (
          <ul className="space-y-2">
            {demonstratedStrengths.map((item) => (
              <li
                key={item.name}
                className={cn(CLIENT_SURFACE_CARD, "flex items-center justify-between rounded-sm border bg-card px-4 py-3")}
              >
                <span className="font-medium text-foreground">{item.name}</span>
                <span className="flex items-center gap-2">
                  <span className={cn(CLIENT_METRIC_VALUE, getScoreTextColorClass(item.score))}>
                    {item.score}
                  </span>
                  <ClientStatusBadge tone="success">Demonstrated</ClientStatusBadge>
                </span>
              </li>
            ))}
          </ul>
        ) : showComparative ? (
          <ul className="space-y-2">
            {comparativeStrengths.map((item) => (
              <li
                key={item.name}
                className={cn(CLIENT_SURFACE_CARD, "flex items-center justify-between rounded-sm border bg-card px-4 py-3")}
              >
                <span className="font-medium text-foreground">{item.name}</span>
                <span className="flex items-center gap-2">
                  <span className={cn(CLIENT_METRIC_VALUE, "text-muted-foreground")}>
                    {item.score}
                  </span>
                  <ClientStatusBadge tone="muted">Relative</ClientStatusBadge>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-sm border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            Strength evidence will appear after a completed assessment with pillar scores at
            Developing or higher.
          </p>
        )}
      </section>

      <section className="space-y-4" aria-labelledby="overview-exposure-heading">
        <ClientSectionHeader
          title="Areas of exposure"
          description="Lowest official pillar scores from your assessment — review related improvement opportunities."
        />
        <h2 id="overview-exposure-heading" className="sr-only">
          Areas of exposure
        </h2>
        {exposures.length === 0 ? (
          <p className="rounded-sm border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            Exposure insights appear when pillar scores are available from a completed assessment.
          </p>
        ) : (
          <ul className="space-y-2">
            {exposures.map((pillar) => (
              <li
                key={pillar.code}
                className={cn(CLIENT_SURFACE_CARD, "flex items-center justify-between rounded-sm border bg-card px-4 py-3")}
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{pillar.name}</p>
                  {pillar.maturityLabel ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">{pillar.maturityLabel}</p>
                  ) : null}
                </div>
                <span className={cn(CLIENT_METRIC_VALUE, getScoreTextColorClass(pillar.score))}>
                  {pillar.score}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
