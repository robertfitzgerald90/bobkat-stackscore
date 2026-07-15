import { describe, expect, it } from "vitest";
import { CLIENT_DASHBOARD_PREVIEW_DETAIL } from "@/lib/marketing/client-dashboard-preview-data";

describe("client dashboard preview data", () => {
  it("uses static Pinnacle Engineering demo values", () => {
    const { profile, client, workspace, businessSnapshot } = CLIENT_DASHBOARD_PREVIEW_DETAIL;

    expect(client.companyName).toBe("Pinnacle Engineering");
    expect(profile.overallStackScore).toBe(53);
    expect(workspace.kpis.projectedScore).toBe(84);
    expect(workspace.kpis.openProjectsCount).toBe(4);
    expect(workspace.kpis.criticalRecommendationsCount).toBe(7);
    expect(workspace.kpis.immediateFocusCount).toBe(7);
    expect(workspace.items).toHaveLength(5);
    expect(businessSnapshot.primaryBusinessGoalLabel).toBe("Improve Cybersecurity");
    expect(profile.maturityTierLabel).toBe("Developing");
  });
});
