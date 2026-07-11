import { BRAND } from "@/lib/branding";
import { getReportScoreTextClass } from "@/lib/reports/document-score-display";
import { cn } from "@/lib/utils";

type AssessmentReportHeroProps = {
  clientName: string;
  assessmentDate: string;
  overallScore: number;
  overallRatingLabel: string;
  projectedScore: number;
};

export function AssessmentReportHero({
  clientName,
  assessmentDate,
  overallScore,
  overallRatingLabel,
  projectedScore,
}: AssessmentReportHeroProps) {
  return (
    <header className="report-cover">
      <div className="report-cover-brand">
        <p className="report-cover-product">{BRAND.productName.toUpperCase()}</p>
        <p className="report-cover-powered">Powered by {BRAND.companyName}</p>
      </div>

      <h1 className="report-cover-title">Technology Maturity Assessment Report</h1>
      <p className="report-cover-description">
        A comprehensive evaluation of technology posture, operational readiness, and improvement
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
            {overallScore}
          </p>
          <p className="report-cover-meta-note">{overallRatingLabel}</p>
        </div>
        <div className="report-cover-meta-item">
          <p className="report-cover-meta-label">Technology health</p>
          <p className="report-cover-meta-value">{overallRatingLabel}</p>
          <p className="report-cover-meta-note">
            Projected {projectedScore} with recommended actions
          </p>
        </div>
      </div>

      <p className="report-cover-attribution">Prepared by {BRAND.companyName}</p>
    </header>
  );
}
