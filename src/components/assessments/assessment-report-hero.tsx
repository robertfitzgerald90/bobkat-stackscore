import { BRAND } from "@/lib/branding";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
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
    <header className="report-hero">
      <div className="report-hero-brand">
        <p className="report-hero-product">{BRAND.productName}</p>
        <p className="report-hero-company">{BRAND.companyName}</p>
      </div>

      <h1 className="report-hero-title">Technology Maturity Assessment Report</h1>
      <p className="report-hero-subtitle">
        A comprehensive evaluation of technology posture, operational readiness, and improvement
        opportunities prepared for executive review.
      </p>

      <div className="report-hero-meta">
        <div className="report-hero-meta-item">
          <p className="report-hero-meta-label">Prepared for</p>
          <p className="report-hero-meta-value">{clientName}</p>
        </div>
        <div className="report-hero-meta-item">
          <p className="report-hero-meta-label">Assessment date</p>
          <p className="report-hero-meta-value">{assessmentDate}</p>
        </div>
        <div className="report-hero-meta-item">
          <p className="report-hero-meta-label">Overall StackScore</p>
          <p className={cn("report-hero-score", getScoreTextColorClass(overallScore))}>
            {overallScore}
          </p>
          <p className="report-hero-meta-note">{overallRatingLabel}</p>
        </div>
        <div className="report-hero-meta-item">
          <p className="report-hero-meta-label">Technology health</p>
          <p className="report-hero-meta-value">{overallRatingLabel}</p>
          <p className="report-hero-meta-note">
            Projected {projectedScore} with recommended actions
          </p>
        </div>
      </div>

      <p className="report-hero-attribution">Prepared by {BRAND.companyName}</p>
    </header>
  );
}
