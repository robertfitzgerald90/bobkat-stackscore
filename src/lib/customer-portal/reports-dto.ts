/**
 * SS-UX-008 — Customer reports hub DTO.
 * Maps existing assessment, progress, and business-review records.
 * Does not score, forecast, or invent download URLs.
 */

import { formatAssessmentType } from "@/lib/assessments/display";
import { clientRecommendationsPath, clientWorkspaceRoadmapPath } from "@/lib/clients/paths";
import { formatDisplayDate } from "@/lib/display";

export type CustomerReportAction = {
  id: "view" | "download" | "open-review";
  label: string;
  href: string;
  download: boolean;
};

export type CustomerReportCard = {
  id: string;
  title: string;
  typeLabel: string;
  periodLabel: string | null;
  completedAtLabel: string | null;
  companyName: string;
  actions: CustomerReportAction[];
};

export type CustomerReportGuideItem = {
  id: "assessment" | "opportunities" | "roadmap" | "business-review";
  title: string;
  body: string;
  href: string | null;
  actionLabel: string | null;
};

export type CustomerReportsExperienceDto = {
  clientId: string;
  companyName: string;
  latest: CustomerReportCard | null;
  history: CustomerReportCard[];
  executiveReports: CustomerReportCard[];
  /** Null hides the section. An empty list is an entitled empty state. */
  businessReviews: CustomerReportCard[] | null;
  guide: CustomerReportGuideItem[];
  resumeAssessmentHref: string | null;
};

export type CustomerReportAssessmentInput = {
  id: string;
  assessmentName: string;
  assessmentType: string;
  status: string;
  completedAt: string | null;
  createdAt: string;
};

export type CustomerReportReviewInput = {
  id: string;
  title: string;
  status: string;
  reviewPeriodLabel: string;
  reviewPeriodStart: string;
  generatedAt: string | null;
};

export type BuildCustomerReportsExperienceInput = {
  clientId: string;
  companyName: string;
  assessments: CustomerReportAssessmentInput[];
  progressReport: { reportPeriodLabel: string } | null;
  reviews: CustomerReportReviewInput[];
  /** Existing vCIO subscription, including grace and read-only. */
  includeBusinessReviews: boolean;
  hasDraftAssessment: boolean;
};

function assessmentViewHref(assessmentId: string): string {
  return `/assessments/${assessmentId}/report`;
}

function assessmentPdfHref(assessmentId: string): string {
  return `/api/v1/assessments/${assessmentId}/export/pdf`;
}

function reviewViewHref(clientId: string, reviewId: string): string {
  return `/clients/${clientId}/quarterly-review/${reviewId}`;
}

function reviewPdfHref(clientId: string, reviewId: string): string {
  return `/api/v1/clients/${clientId}/qbr/${reviewId}/pdf`;
}

function assessmentCard(
  companyName: string,
  assessment: CustomerReportAssessmentInput,
): CustomerReportCard {
  return {
    id: `assessment:${assessment.id}`,
    title: assessment.assessmentName,
    typeLabel: "Assessment report",
    periodLabel: formatAssessmentType(assessment.assessmentType),
    completedAtLabel: formatDisplayDate(assessment.completedAt),
    companyName,
    actions: [
      {
        id: "view",
        label: "View report",
        href: assessmentViewHref(assessment.id),
        download: false,
      },
      {
        id: "download",
        label: "Download PDF",
        href: assessmentPdfHref(assessment.id),
        download: true,
      },
    ],
  };
}

function completedAssessmentsNewestFirst(
  assessments: CustomerReportAssessmentInput[],
): CustomerReportAssessmentInput[] {
  return assessments
    .filter((assessment) => assessment.status === "completed" && assessment.completedAt)
    .sort((left, right) => {
      const byCompleted =
        new Date(right.completedAt ?? 0).getTime() - new Date(left.completedAt ?? 0).getTime();
      if (byCompleted !== 0) return byCompleted;
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });
}

function publishedReviewsNewestFirst(
  reviews: CustomerReportReviewInput[],
): CustomerReportReviewInput[] {
  return reviews
    .filter((review) => review.status === "generated")
    .sort(
      (left, right) =>
        new Date(right.reviewPeriodStart).getTime() - new Date(left.reviewPeriodStart).getTime(),
    );
}

function reviewCard(
  clientId: string,
  companyName: string,
  review: CustomerReportReviewInput,
): CustomerReportCard {
  return {
    id: `review:${review.id}`,
    title: review.title,
    typeLabel: "Business review",
    periodLabel: review.reviewPeriodLabel,
    completedAtLabel: review.generatedAt ? formatDisplayDate(review.generatedAt) : null,
    companyName,
    actions: [
      {
        id: "open-review",
        label: "Open business review",
        href: reviewViewHref(clientId, review.id),
        download: false,
      },
      {
        id: "download",
        label: "Download PDF",
        href: reviewPdfHref(clientId, review.id),
        download: true,
      },
    ],
  };
}

function buildGuide(input: {
  clientId: string;
  latest: CustomerReportCard | null;
  showBusinessReviewLink: boolean;
}): CustomerReportGuideItem[] {
  const assessmentHref =
    input.latest?.actions.find((action) => action.id === "view")?.href ?? null;

  return [
    {
      id: "assessment",
      title: "Technology maturity assessment",
      body: "A completed assessment is the source of your official StackScore and maturity level. That result changes only when another assessment is completed.",
      href: assessmentHref,
      actionLabel: assessmentHref ? "View latest report" : null,
    },
    {
      id: "opportunities",
      title: "Improvement opportunities",
      body: "Recommendations describe findings and suggested actions from the assessment. They do not change your official StackScore.",
      href: clientRecommendationsPath(input.clientId),
      actionLabel: "View opportunities",
    },
    {
      id: "roadmap",
      title: "Roadmap progress",
      body: "Roadmap progress tracks implementation of approved phases. It is separate from your official StackScore and is not a forecast.",
      href: clientWorkspaceRoadmapPath(input.clientId),
      actionLabel: "View roadmap",
    },
    {
      id: "business-review",
      title: "Business review",
      body: "A business review is a published strategic review for a reporting period. It summarizes work already recorded and does not predict a future StackScore.",
      href: input.showBusinessReviewLink
        ? `/clients/${input.clientId}/quarterly-reviews`
        : null,
      actionLabel: input.showBusinessReviewLink ? "View business reviews" : null,
    },
  ];
}

export function buildCustomerReportsExperience(
  input: BuildCustomerReportsExperienceInput,
): CustomerReportsExperienceDto {
  const completed = completedAssessmentsNewestFirst(input.assessments);
  const [latestAssessment, ...earlier] = completed;
  const latest = latestAssessment
    ? assessmentCard(input.companyName, latestAssessment)
    : null;

  const executiveReports: CustomerReportCard[] = [];
  if (input.progressReport && latest) {
    executiveReports.push({
      id: "executive:progress",
      title: "Technology Progress Report",
      typeLabel: "Executive report",
      periodLabel: input.progressReport.reportPeriodLabel,
      completedAtLabel: null,
      companyName: input.companyName,
      actions: [
        {
          id: "view",
          label: "View report",
          href: `/clients/${input.clientId}/progress-report`,
          download: false,
        },
      ],
    });
  }

  const businessReviews = input.includeBusinessReviews
    ? publishedReviewsNewestFirst(input.reviews).map((review) =>
        reviewCard(input.clientId, input.companyName, review),
      )
    : null;

  return {
    clientId: input.clientId,
    companyName: input.companyName,
    latest,
    history: earlier.map((assessment) => assessmentCard(input.companyName, assessment)),
    executiveReports,
    businessReviews,
    guide: buildGuide({
      clientId: input.clientId,
      latest,
      showBusinessReviewLink: businessReviews !== null,
    }),
    resumeAssessmentHref: !latest && input.hasDraftAssessment ? "/assessment/start" : null,
  };
}

/** Every card id in the hub, for duplicate checks. */
export function customerReportCardIds(experience: CustomerReportsExperienceDto): string[] {
  return [
    ...(experience.latest ? [experience.latest.id] : []),
    ...experience.history.map((card) => card.id),
    ...experience.executiveReports.map((card) => card.id),
    ...(experience.businessReviews ?? []).map((card) => card.id),
  ];
}
