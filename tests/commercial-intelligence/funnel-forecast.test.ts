import { describe, expect, it } from "vitest";
import { buildSalesFunnel, proposalStageWeight } from "@/lib/commercial-intelligence/funnel";
import { computeRevenueForecast } from "@/lib/commercial-intelligence/forecast";
import { getReportLibrary } from "@/lib/commercial-intelligence/reporting-library";
import { listAutomationWorkflows } from "@/lib/automation";

describe("sales funnel", () => {
  it("computes stage conversion rates", () => {
    const funnel = buildSalesFunnel({
      marketing_lead: 100,
      assessment_purchased: 40,
      assessment_completed: 30,
      roadmap_delivered: 25,
      proposal_generated: 20,
      proposal_approved: 10,
      implementation_started: 8,
      implementation_completed: 6,
      managed_services_active: 5,
      strategic_consulting_active: 3,
    });

    expect(funnel[0]?.conversionFromPreviousPercent).toBeNull();
    expect(funnel[1]?.conversionFromPreviousPercent).toBe(40);
    expect(funnel[5]?.count).toBe(10);
    expect(proposalStageWeight("viewed")).toBeGreaterThan(proposalStageWeight("draft"));
  });
});

describe("revenue forecast", () => {
  it("separates recurring, pipeline, and weighted pipeline values", () => {
    const forecast = computeRevenueForecast({
      recurringMonthly: 2500,
      pendingProposals: [
        { oneTimeInvestment: 10000, status: "sent" },
        { oneTimeInvestment: 5000, status: "viewed" },
      ],
      approvedPhaseOneTimeRemaining: 8000,
      expectedAssessmentRevenue: 1200,
      renewalRevenueNext90Days: 900,
    });

    expect(forecast.recurringMonthly).toBe(2500);
    expect(forecast.pendingProposalValue).toBe(15000);
    expect(forecast.weightedPipelineValue).toBe(10000 * 0.45 + 5000 * 0.65);
    expect(forecast.pipelineValue).toBeGreaterThan(forecast.pendingProposalValue);
    expect(forecast.annualRevenueForecast).toBeGreaterThan(forecast.monthlyRevenueForecast);
  });
});

describe("reporting library and automation catalog", () => {
  it("exposes report and automation extension points", () => {
    const reports = getReportLibrary("client-1");
    expect(reports.some((item) => item.key === "quarterly_business_review")).toBe(true);
    expect(reports.every((item) => item.hrefTemplate.includes("client-1"))).toBe(true);

    const workflows = listAutomationWorkflows();
    expect(workflows.some((item) => item.key === "assessment_to_roadmap")).toBe(true);
    expect(workflows.some((item) => item.status === "connected")).toBe(true);
  });
});
