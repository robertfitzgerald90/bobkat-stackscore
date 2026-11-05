import { BRAND } from "@/lib/branding";
import { getReportTypeMeta } from "@/lib/reports/meta";
import { formatMaturityScore } from "@/lib/scoring/score-display";

type AssessmentReportHeroProps = {
  clientName: string;
  assessmentDate: string;
  overallScore: number;
  overallMaturityLabel: string;
  projectedScore?: number | null;
  improvementOpportunityCount?: number;
  suppressCatalogProjectedMaturity?: boolean;
};

/** Compact document heading; score cards live in the report body, as in Progress. */
export function AssessmentReportHero({
  clientName,
  assessmentDate,
  overallScore,
  overallMaturityLabel,
  projectedScore,
  improvementOpportunityCount,
  suppressCatalogProjectedMaturity = false,
}: AssessmentReportHeroProps) {
  const meta = getReportTypeMeta("assessment");
  return (
    <header className="border-b border-[color:var(--report-border-light)] px-6 py-8 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        Prepared by {BRAND.companyName}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
        {meta.title}
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {meta.subtitle}
      </p>
      <p className="mt-5 text-lg font-semibold text-foreground">{clientName}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Assessment date: {assessmentDate}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        StackScore {formatMaturityScore(overallScore)} / 100 ·{" "}
        {overallMaturityLabel}
        {improvementOpportunityCount !== undefined
          ? ` · ${improvementOpportunityCount} improvement opportunities`
          : ""}
      </p>
      {!suppressCatalogProjectedMaturity &&
      projectedScore !== null &&
      projectedScore !== undefined ? (
        <p className="mt-1 text-xs text-muted-foreground">
          Internal planning estimate: {formatMaturityScore(projectedScore)} /
          100. Score changes require reassessment.
        </p>
      ) : null}
    </header>
  );
}
