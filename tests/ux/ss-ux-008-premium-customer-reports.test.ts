import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { formatDisplayDate } from "@/lib/display";
import {
  buildCustomerReportsExperience,
  customerReportCardIds,
  type CustomerReportAssessmentInput,
  type CustomerReportReviewInput,
} from "@/lib/customer-portal/reports-dto";

const COMPANY = "ABC LLC";

function assessment(
  overrides: Partial<CustomerReportAssessmentInput> & Pick<CustomerReportAssessmentInput, "id">,
): CustomerReportAssessmentInput {
  return {
    assessmentName: `Assessment ${overrides.id}`,
    assessmentType: "initial",
    status: "completed",
    completedAt: "2026-01-15T18:00:00.000Z",
    createdAt: "2026-01-01T18:00:00.000Z",
    ...overrides,
  };
}

function review(
  overrides: Partial<CustomerReportReviewInput> & Pick<CustomerReportReviewInput, "id">,
): CustomerReportReviewInput {
  return {
    title: `Review ${overrides.id}`,
    status: "generated",
    reviewPeriodLabel: "Q1 2026",
    reviewPeriodStart: "2026-01-01T00:00:00.000Z",
    generatedAt: "2026-04-02T18:00:00.000Z",
    ...overrides,
  };
}

function build(
  overrides: Partial<Parameters<typeof buildCustomerReportsExperience>[0]> = {},
) {
  return buildCustomerReportsExperience({
    clientId: "client-abc",
    companyName: COMPANY,
    assessments: [],
    progressReport: null,
    reviews: [],
    includeBusinessReviews: false,
    hasDraftAssessment: false,
    ...overrides,
  });
}

describe("SS-UX-008 premium customer reports", () => {
  it("features the newest completed assessment and keeps earlier reports newest first", () => {
    const experience = build({
      assessments: [
        assessment({
          id: "older",
          assessmentName: "Baseline",
          completedAt: "2025-06-01T18:00:00.000Z",
          createdAt: "2025-05-01T18:00:00.000Z",
        }),
        assessment({
          id: "newest",
          assessmentName: "Annual",
          assessmentType: "annual",
          completedAt: "2026-06-01T18:00:00.000Z",
          createdAt: "2026-05-01T18:00:00.000Z",
        }),
        assessment({
          id: "middle",
          assessmentName: "Follow up",
          assessmentType: "followup",
          completedAt: "2025-12-01T18:00:00.000Z",
          createdAt: "2025-11-01T18:00:00.000Z",
        }),
        assessment({ id: "draft", status: "draft", completedAt: null }),
        assessment({ id: "archived", status: "archived", completedAt: "2026-07-01T18:00:00.000Z" }),
      ],
      progressReport: { reportPeriodLabel: "Since June 2026 assessment" },
    });

    expect(experience.latest?.id).toBe("assessment:newest");
    expect(experience.latest?.title).toBe("Annual");
    expect(experience.latest?.typeLabel).toBe("Assessment report");
    expect(experience.latest?.periodLabel).toBe("Annual Review");
    expect(experience.latest?.completedAtLabel).toBe(
      formatDisplayDate("2026-06-01T18:00:00.000Z"),
    );
    expect(experience.latest?.companyName).toBe(COMPANY);
    expect(experience.latest?.actions.map((action) => action.href)).toEqual([
      "/assessments/newest/report",
      "/api/v1/assessments/newest/export/pdf",
    ]);
    expect(experience.history.map((card) => card.id)).toEqual([
      "assessment:middle",
      "assessment:older",
    ]);
    expect(experience.executiveReports).toHaveLength(1);
    expect(experience.executiveReports[0]?.actions).toEqual([
      {
        id: "view",
        label: "View report",
        href: "/clients/client-abc/progress-report",
        download: false,
      },
    ]);
  });

  it("does not duplicate a report and omits drafts from history", () => {
    const experience = build({
      assessments: [assessment({ id: "only" })],
      progressReport: { reportPeriodLabel: "Current period" },
      reviews: [review({ id: "q1" })],
      includeBusinessReviews: true,
    });

    const ids = customerReportCardIds(experience);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.filter((id) => id === "assessment:only")).toHaveLength(1);
    expect(experience.history).toEqual([]);
    expect(JSON.stringify(experience)).not.toMatch(/projected/i);
  });

  it("hides business reviews for assessment-only customers and shows them when entitled", () => {
    const published = [review({ id: "hidden" })];
    const assessmentOnly = build({ reviews: published, includeBusinessReviews: false });
    expect(assessmentOnly.businessReviews).toBeNull();
    expect(assessmentOnly.guide.find((item) => item.id === "business-review")?.href).toBeNull();

    const entitledEmpty = build({ includeBusinessReviews: true, reviews: [] });
    expect(entitledEmpty.businessReviews).toEqual([]);
    expect(entitledEmpty.guide.find((item) => item.id === "business-review")?.href).toBe(
      "/clients/client-abc/quarterly-reviews",
    );

    const entitled = build({
      includeBusinessReviews: true,
      reviews: [
        review({ id: "draft-review", status: "draft", reviewPeriodStart: "2026-07-01T00:00:00.000Z" }),
        review({ id: "older-review", reviewPeriodStart: "2025-01-01T00:00:00.000Z", title: "2025 review" }),
        review({ id: "newer-review", reviewPeriodStart: "2026-04-01T00:00:00.000Z", title: "2026 review" }),
      ],
    });
    expect(entitled.businessReviews?.map((card) => card.title)).toEqual([
      "2026 review",
      "2025 review",
    ]);
    expect(entitled.businessReviews?.[0]?.actions.map((action) => [action.label, action.href])).toEqual([
      ["Open business review", "/clients/client-abc/quarterly-review/newer-review"],
      ["Download PDF", "/api/v1/clients/client-abc/qbr/newer-review/pdf"],
    ]);
  });

  it("offers resume only when no completed report exists", () => {
    const empty = build({ hasDraftAssessment: true });
    expect(empty.latest).toBeNull();
    expect(empty.history).toEqual([]);
    expect(empty.executiveReports).toEqual([]);
    expect(empty.resumeAssessmentHref).toBe("/assessment/start");

    const completed = build({
      assessments: [assessment({ id: "done" })],
      hasDraftAssessment: true,
    });
    expect(completed.resumeAssessmentHref).toBeNull();
  });

  it("keeps the customer hub on the existing route and leaves the staff hub in place", () => {
    const page = readFileSync(
      join(process.cwd(), "src/app/(dashboard)/clients/[id]/executive-reports/page.tsx"),
      "utf8",
    );
    const experience = readFileSync(
      join(process.cwd(), "src/lib/customer-portal/reports-experience.ts"),
      "utf8",
    );

    expect(page).toContain("if (clientUser?.clientId !== id) notFound()");
    expect(page).toContain("CustomerReportsExperience");
    expect(page).toContain("WorkspaceHubLinks");
    expect(page).toContain("/clients/${id}/progress-report");
    expect(page).toContain("/clients/${id}/quarterly-review");
    expect(experience).toContain("getClientVcioEntitlement");
    expect(experience).toContain("loadProgressReport");
    expect(experience).toContain("listQuarterlyBusinessReviews");
    expect(experience).toContain("includeBusinessReviews: entitlement.hasSubscription || generatedReviews.length > 0");
    expect(page).not.toContain("projectedFinalScore");
  });
});
