"use client";

import { buildTipReportData } from "@/lib/technology-improvement-plan/report-data";
import type { TipPlanDetail } from "@/lib/technology-improvement-plan/types";
import {
  ReportBody,
  ReportDocument,
  ReportFooter,
  ReportPageBreak,
  ReportShell,
} from "@/components/reports";
import {
  TipApprovalSection,
  TipBusinessOutcomesSection,
  TipExecutiveSummarySection,
  TipInvestmentSection,
  TipJourneyClosingSection,
  TipPillarScorecardsSection,
  TipRecommendationsSection,
  TipReportCover,
  TipRoadmapSection,
} from "@/components/technology-improvement-plan/tip-report-sections";

type TipReportPreviewProps = {
  plan: TipPlanDetail;
  isAdmin: boolean;
  executiveSummary: string;
  onExecutiveSummaryChange?: (value: string) => void;
  isEditable?: boolean;
};

export function TipReportPreview({
  plan,
  isAdmin,
  executiveSummary,
  onExecutiveSummaryChange,
  isEditable = false,
}: TipReportPreviewProps) {
  const data = buildTipReportData(
    {
      ...plan,
      executiveSummary,
      wizardState: { ...plan.wizardState, executiveSummary },
    },
    isAdmin,
  );

  return (
    <ReportShell className="tip-executive-report">
      <ReportDocument className="report-document-executive" documentTheme>
        <TipReportCover data={data} />

        <ReportBody className="report-body-executive">
          <TipExecutiveSummarySection
            data={data}
            executiveSummary={executiveSummary}
            isEditable={isEditable}
            onExecutiveSummaryChange={onExecutiveSummaryChange}
          />

          <TipBusinessOutcomesSection data={data} />
          <TipPillarScorecardsSection data={data} />

          <ReportPageBreak />

          <TipRecommendationsSection data={data} />
          <TipRoadmapSection data={data} />

          <ReportPageBreak />

          <TipInvestmentSection data={data} isAdmin={isAdmin} />
          <TipApprovalSection clientName={data.clientName} />

          <TipJourneyClosingSection data={data} />

          <ReportFooter confidentialFor={data.clientName} documentTheme />
        </ReportBody>
      </ReportDocument>
    </ReportShell>
  );
}
