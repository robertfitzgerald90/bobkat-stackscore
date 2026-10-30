/**
 * SS-UX-008 — Assemble the customer reports hub from existing records.
 * Does not generate reports or change entitlements.
 */

import { getLatestDraftAssessmentForClientUser } from "@/lib/auth/client-access";
import { getClientAssessmentHistory } from "@/lib/assessments/reassessment";
import {
  buildCustomerReportsExperience,
  type CustomerReportsExperienceDto,
} from "@/lib/customer-portal/reports-dto";
import { listQuarterlyBusinessReviews } from "@/lib/qbr";
import { loadProgressReport } from "@/lib/reports/progress";
import { getClientVcioEntitlement } from "@/lib/vcio/entitlements";

export async function getCustomerReportsExperience(input: {
  clientId: string;
  companyName: string;
  userId: string;
}): Promise<CustomerReportsExperienceDto> {
  const [assessments, entitlement, reviews, progressReport, draft] = await Promise.all([
    getClientAssessmentHistory(input.clientId),
    getClientVcioEntitlement(input.clientId),
    listQuarterlyBusinessReviews(input.clientId),
    loadProgressReport(input.clientId),
    getLatestDraftAssessmentForClientUser(input.userId),
  ]);

  const generatedReviews = reviews.filter((review) => review.status === "generated");

  return buildCustomerReportsExperience({
    clientId: input.clientId,
    companyName: input.companyName,
    assessments,
    progressReport: progressReport
      ? { reportPeriodLabel: progressReport.reportPeriodLabel }
      : null,
    reviews: generatedReviews,
    includeBusinessReviews: entitlement.hasSubscription || generatedReviews.length > 0,
    hasDraftAssessment: Boolean(draft),
  });
}
