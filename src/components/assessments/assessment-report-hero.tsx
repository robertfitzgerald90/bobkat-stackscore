import { BRAND } from "@/lib/branding";
import { getReportScoreTextClass } from "@/lib/reports/document-score-display";
import { formatMaturityScore } from "@/lib/scoring/score-display";
import { cn } from "@/lib/utils";

type AssessmentReportHeroProps = {
  clientName: string;
  assessmentDate: string;
  overallScore: number;
  /** Display maturity/rating label under StackScore (DOC-119 for customers). */
  overallMaturityLabel: string;
  projectedScore?: number | null;
  /** Active improvement opportunities (open + accepted + in_progress) when known. */
  improvementOpportunityCount?: number;
  suppressCatalogProjectedMaturity?: boolean;
};

export function AssessmentReportHero({
  clientName,
  assessmentDate,
  overallScore,
  overallMaturityLabel,
  projectedScore,
  improvementOpportunityCount,
  suppressCatalogProjectedMaturity = false,
}: AssessmentReportHeroProps) {
  const showProjected =
    !suppressCatalogProjectedMaturity &&
    projectedScore !== null &&
    projectedScore !== undefined;

  return (
    <header className="report-cover">
      <div className="report-cover-brand">
        <p className="report-cover-product">{BRAND.productName.toUpperCase()}</p>
        <p className="report-cover-powered">Powered by {BRAND.companyName}</p>
      </div>

      <h1 className="report-cover-title">Technology Maturity Assessment Report</h1>
      <p className="report-cover-description">
        A comprehensive evaluation of technology posture, technology maturity, and improvement
        opportunities prepared for executive review.
      </p>

      <div className="report-cover-meta">
        <div className="report-cover-meta-item">
          <p className="report-cover-meta-label">Prepared for</p>
          <p className="report-cover-meta-value">{clientName}</p>
        </div>
        <div className="report-cover-meta-item">
          <p className="report-cover-meta-label">Assessment date</p>
          <p className="report-cover-meta-value">{assessmentDate}</p>
        </div>
        <div className="report-cover-meta-item">
          <p className="report-cover-meta-label">Overall StackScore</p>
          <p className={cn("report-cover-score", getReportScoreTextClass(overallScore))}>
            {formatMaturityScore(overallScore)}
          </p>
          <p className="report-cover-meta-note">{overallMaturityLabel}</p>
        </div>
        <div className="report-cover-meta-item">
          <p className="report-cover-meta-label">Technology maturity</p>
          <p className="report-cover-meta-value">{overallMaturityLabel}</p>
          <p className="report-cover-meta-note">
            {showProjected
              ? `Projected ${formatMaturityScore(projectedScore)} with recommended actions`
              : improvementOpportunityCount !== undefined
                ? `${improvementOpportunityCount} improvement ${
                    improvementOpportunityCount === 1 ? "opportunity" : "opportunities"
                  } identified`
                : "Prioritized improvement opportunities identified"}
          </p>
        </div>
      </div>

      <p className="report-cover-attribution">Prepared by {BRAND.companyName}</p>
    </header>
  );
}
