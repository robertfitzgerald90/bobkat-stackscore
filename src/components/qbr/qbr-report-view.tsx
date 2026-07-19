"use client";

import {
  ReportBody,
  ReportDocument,
  ReportFooter,
  ReportPrintActions,
  ReportShell,
} from "@/components/reports";
import {
  QbrCompletedWorkPage,
  QbrExecutiveDashboardPage,
  QbrInvestmentPage,
  QbrNextQuarterPage,
  QbrOpportunitiesPage,
  QbrReportCover,
  QbrRoadmapPage,
  QbrTechnologyHealthPage,
} from "@/components/qbr/qbr-report-sections";
import { clientWorkspaceExecutiveReportsPath } from "@/lib/clients/paths";
import { BACK_TO_EXECUTIVE_REPORTS } from "@/lib/technology-maturity/labels";
import type { QbrReportData } from "@/lib/qbr/types";

type QbrReportViewProps = {
  clientId: string;
  data: QbrReportData;
  isEditable?: boolean;
  executiveSummary?: string;
  onExecutiveSummaryChange?: (value: string) => void;
  showActions?: boolean;
};

export function QbrReportView({
  clientId,
  data,
  isEditable = false,
  executiveSummary,
  onExecutiveSummaryChange,
  showActions = true,
}: QbrReportViewProps) {
  const summaryText = executiveSummary ?? data.executiveSummary;

  return (
    <ReportShell className="qbr-executive-report">
      {showActions ? (
        <ReportPrintActions
          clientName={data.clientName}
          title="Quarterly Business Review"
          description={data.reviewPeriodLabel}
          backHref={clientWorkspaceExecutiveReportsPath(clientId)}
          backLabel={BACK_TO_EXECUTIVE_REPORTS}
        />
      ) : null}

      <ReportDocument className="report-document-executive" documentTheme>
        <QbrReportCover data={data} />

        <ReportBody className="report-body-executive">
          <QbrExecutiveDashboardPage
            data={data}
            executiveSummary={summaryText}
            isEditable={isEditable}
            onExecutiveSummaryChange={onExecutiveSummaryChange}
          />
          <QbrTechnologyHealthPage data={data} />
          <QbrCompletedWorkPage data={data} />
          <QbrOpportunitiesPage data={data} />
          <QbrInvestmentPage data={data} />
          <QbrRoadmapPage data={data} />
          <QbrNextQuarterPage data={data} />
          <ReportFooter confidentialFor={data.clientName} documentTheme />
        </ReportBody>
      </ReportDocument>
    </ReportShell>
  );
}
