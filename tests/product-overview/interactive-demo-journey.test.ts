import { describe, expect, it } from "vitest";
import {
  NORTHSTAR_INTERACTIVE_DEMO_SCENARIO,
  createInitialInteractiveDemoState,
  deriveInteractiveDemoView,
  reduceInteractiveDemoState,
} from "@/lib/product-overview/interactive-demo";
import { PRODUCT_OVERVIEW_NAV_ITEMS } from "@/lib/product-overview/navigation";
import { DEMO_EXECUTIVE_REPORTS, getDemoReportPreviewById } from "@/lib/product-overview/demo-execution";
import { DEFAULT_ROADMAP_PHASE_DEFINITIONS } from "@/lib/technology-improvement-plan/roadmap-engine/phase-config";
import { VCIO_MONTHLY_AMOUNT_CENTS } from "@/lib/vcio/constants";
import { DEFAULT_DEMO_COMPANY_PROFILE } from "@/lib/demo-data/demo-financial-profile";
import { NORTHSTAR_DEMO_BUDGET } from "@/lib/product-overview/demo-financials";
import { centsToDollars } from "@/lib/technology-improvement-plan/pricing";

describe("interactive demo scenario", () => {
  it("uses production phase definitions and SMB-aligned company profile", () => {
    const scenario = NORTHSTAR_INTERACTIVE_DEMO_SCENARIO;
    expect(scenario.company.employeeCount).toBe(DEFAULT_DEMO_COMPANY_PROFILE.employeeCount);
    expect(scenario.company.locationCount).toBe(1);
    expect(scenario.company.managedDeviceCount).toBe(60);
    expect(scenario.phases).toHaveLength(4);
    expect(scenario.phases[0]?.id).toBe(DEFAULT_ROADMAP_PHASE_DEFINITIONS[0]?.id);
    expect(scenario.strategicConsultingMonthlyCents).toBe(VCIO_MONTHLY_AMOUNT_CENTS);
    expect(scenario.phases[0]?.monthlyRecurringInvestment).toBe(NORTHSTAR_DEMO_BUDGET.managedEndpointMonthly);
    expect(scenario.assessment.initialStackScore).toBe(58);
    expect(scenario.scoreProgression.afterPhase1Score).toBe(73);
    expect(scenario.scoreProgression.projectedFinalScore).toBe(92);
  });

  it("keeps one-time and monthly totals separated", () => {
    const initial = createInitialInteractiveDemoState();
    const view = deriveInteractiveDemoView(initial);
    expect(view.totalOneTimeInvestment).toBe(23_000);
    expect(view.totalMonthlyRecurring).toBe(1_200);
    expect(view.totalOneTimeInvestment + view.totalMonthlyRecurring).not.toBe(
      view.totalOneTimeInvestment,
    );
    for (const phase of view.phases) {
      if (!phase.showMonthlyRecurring) {
        expect(phase.monthlyRecurringInvestment === 0 || phase.showMonthlyRecurring === false).toBe(
          true,
        );
      }
    }
  });
});

describe("interactive demo state machine", () => {
  it("simulates Phase 1 approval, implementation, completion, and score update", () => {
    let state = createInitialInteractiveDemoState();
    let view = deriveInteractiveDemoView(state);
    expect(view.stage).toBe("phase1_awaiting_approval");
    expect(view.phase1.status).toBe("awaiting_approval");
    expect(view.effectiveScore).toBe(58);
    expect(view.canApprovePhase1).toBe(true);

    state = reduceInteractiveDemoState(state, { type: "approve_phase1" });
    view = deriveInteractiveDemoView(state);
    expect(view.stage).toBe("phase1_approved");
    expect(view.phase1.status).toBe("approved");
    expect(view.proposal.status).toBe("approved");
    expect(view.effectiveScore).toBe(58);

    state = reduceInteractiveDemoState(state, { type: "start_implementation" });
    view = deriveInteractiveDemoView(state);
    expect(view.stage).toBe("phase1_in_progress");
    expect(view.phase1.status).toBe("in_progress");
    expect(view.phase1.completionPercent).toBeGreaterThan(0);
    expect(view.canSimulateCompletion).toBe(true);

    state = reduceInteractiveDemoState(state, { type: "complete_phase1" });
    view = deriveInteractiveDemoView(state);
    expect(view.stage).toBe("phase1_completed");
    expect(view.phase1.status).toBe("completed");
    expect(view.phase2?.status).toBe("awaiting_approval");
    expect(view.effectiveScore).toBe(73);
    expect(view.completedImprovement).toBe(15);
    expect(view.showNextPhaseIntro).toBe(true);
    expect(view.roadmapCompletionPercent).toBeGreaterThan(0);
  });

  it("resets cleanly to the original demo state", () => {
    let state = createInitialInteractiveDemoState();
    state = reduceInteractiveDemoState(state, { type: "approve_phase1" });
    state = reduceInteractiveDemoState(state, { type: "start_implementation" });
    state = reduceInteractiveDemoState(state, { type: "complete_phase1" });
    state = reduceInteractiveDemoState(state, { type: "reset" });
    const view = deriveInteractiveDemoView(state);
    expect(view.stage).toBe("phase1_awaiting_approval");
    expect(view.effectiveScore).toBe(58);
    expect(view.phase1.status).toBe("awaiting_approval");
    expect(view.proposal.status).toBe("sent");
  });
});

describe("interactive demo navigation and reports", () => {
  it("exposes the guided journey navigation sequence", () => {
    expect(PRODUCT_OVERVIEW_NAV_ITEMS.map((item) => item.id)).toEqual([
      "overview",
      "assessment",
      "roadmap",
      "phase-proposal",
      "implementation",
      "improvement",
      "budget",
      "reports",
    ]);
  });

  it("previews phased roadmap reports instead of a flat improvement plan", () => {
    expect(DEMO_EXECUTIVE_REPORTS.map((report) => report.id)).toContain("report-roadmap");
    expect(DEMO_EXECUTIVE_REPORTS.map((report) => report.id)).toContain("report-phase-proposal");
    expect(DEMO_EXECUTIVE_REPORTS.map((report) => report.id)).not.toContain(
      "report-improvement-plan",
    );
    const roadmap = getDemoReportPreviewById("report-roadmap");
    expect(roadmap?.title).toContain("Roadmap");
    expect(roadmap?.sections.some((section) => section.heading.includes("Phase"))).toBe(true);
    const budget = getDemoReportPreviewById("report-budget");
    expect(budget?.metrics?.some((metric) => metric.label.includes("One-Time"))).toBe(true);
    expect(budget?.metrics?.some((metric) => metric.label.includes("Monthly"))).toBe(true);
  });

  it("keeps Strategic IT Consulting price aligned with production cents", () => {
    expect(centsToDollars(VCIO_MONTHLY_AMOUNT_CENTS)).toBe(300);
  });
});
