import { describe, expect, it } from "vitest";
import { assessmentExecutiveOverviewDemoData } from "@/lib/demo-data/assessment-executive-overview";
import { CLIENT_DASHBOARD_PREVIEW_DETAIL } from "@/lib/marketing/client-dashboard-preview-data";

describe("assessment executive overview demo data", () => {
  it("uses static Pinnacle Engineering demo values", () => {
    const data = assessmentExecutiveOverviewDemoData;

    expect(data.organizationName).toBe("Pinnacle Engineering");
    expect(data.stackScore).toBe(53);
    expect(data.kpis.projectedScore).toBe(84);
    expect(data.kpis.openProjectsCount).toBe(4);
    expect(data.kpis.criticalRecommendationsCount).toBe(7);
    expect(data.kpis.immediateFocusCount).toBe(7);
    expect(data.focusItems).toHaveLength(5);
    expect(data.primaryBusinessGoalLabel).toBe("Improve Cybersecurity");
    expect(data.maturityTierLabel).toBe("Developing");
  });

  it("maps demo data into client dashboard preview detail", () => {
    const { profile, client, workspace } = CLIENT_DASHBOARD_PREVIEW_DETAIL;

    expect(client.companyName).toBe("Pinnacle Engineering");
    expect(profile.overallStackScore).toBe(53);
    expect(workspace.kpis.projectedScore).toBe(84);
    expect(workspace.items).toHaveLength(5);
  });
});
