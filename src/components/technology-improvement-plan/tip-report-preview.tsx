"use client";

import type { ReactNode } from "react";
import { buildTipReportData } from "@/lib/technology-improvement-plan/report-data";
import type { TipPlanDetail } from "@/lib/technology-improvement-plan/types";
import {
  ReportBody,
  ReportDocument,
  ReportFooter,
  ReportShell,
} from "@/components/reports";
import {
  TipApprovalSection,
  TipCurrentMaturitySection,
  TipExecutiveSummarySection,
  TipInvestmentSection,
  TipJourneyClosingSection,
  TipNextStepsSection,
  TipPhaseDetailSections,
  TipReportCover,
  TipRoadmapOverviewSection,
} from "@/components/technology-improvement-plan/tip-report-sections";

type TipReportPreviewProps = {
  plan: TipPlanDetail;
  isAdmin: boolean;
  executiveSummary: string;
  onExecutiveSummaryChange?: (value: string) => void;
  isEditable?: boolean;
  /** When set, only this page index (0-based) is visible in the Step 6 preview workspace. */
  activePageIndex?: number | null;
};

function TipPreviewPage({
  pageIndex,
  activePageIndex,
  children,
}: {
  pageIndex: number;
  activePageIndex: number | null | undefined;
  children: ReactNode;
}) {
  const hidden = activePageIndex != null && activePageIndex !== pageIndex;

  return (
    <div
      data-report-preview-page
      data-page-index={pageIndex}
      className={hidden ? "hidden" : undefined}
      aria-hidden={hidden}
    >
      {children}
    </div>
  );
}

export function TipReportPreview({
  plan,
  isAdmin,
  executiveSummary,
  onExecutiveSummaryChange,
  isEditable = false,
  activePageIndex = null,
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
        <TipPreviewPage pageIndex={0} activePageIndex={activePageIndex}>
          <TipReportCover data={data} />
        </TipPreviewPage>

        <ReportBody className="report-body-executive">
          <TipPreviewPage pageIndex={1} activePageIndex={activePageIndex}>
            <TipExecutiveSummarySection
              data={data}
              executiveSummary={executiveSummary}
              isEditable={isEditable}
              onExecutiveSummaryChange={onExecutiveSummaryChange}
            />
            <TipCurrentMaturitySection data={data} />
          </TipPreviewPage>

          <TipPreviewPage pageIndex={2} activePageIndex={activePageIndex}>
            <TipRoadmapOverviewSection data={data} />
          </TipPreviewPage>

          <TipPreviewPage pageIndex={3} activePageIndex={activePageIndex}>
            <TipPhaseDetailSections data={data} />
          </TipPreviewPage>

          <TipPreviewPage pageIndex={4} activePageIndex={activePageIndex}>
            <TipInvestmentSection data={data} isAdmin={isAdmin} />
            <TipNextStepsSection />
            <TipApprovalSection
              clientName={data.clientName}
              phases={data.technologyRoadmap.phases}
            />
            <TipJourneyClosingSection data={data} />
            <ReportFooter confidentialFor={data.clientName} documentTheme />
          </TipPreviewPage>
        </ReportBody>
      </ReportDocument>
    </ReportShell>
  );
}
