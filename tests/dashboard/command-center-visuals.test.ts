import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { PortfolioHealth } from "@/components/dashboard/portfolio-health";
import type { CommandCenterSummary } from "@/lib/dashboard/command-center-types";
import { buildCommandCenterQuickActions } from "@/lib/dashboard/command-center-rules";

function summary(role = "admin"): CommandCenterSummary {
  const distribution = {
    critical: 0,
    at_risk: 0,
    stable: 0,
    strong: 0,
    exceptional: 0,
  };
  return {
    role,
    generatedAt: "2026-11-06T00:00:00.000Z",
    pulse: {
      totalClients: 0,
      activeAssessments: 0,
      completedAssessments: 0,
      activeProjects: 0,
      openLeads: role === "admin" ? 0 : null,
      openLeadsBreakdown: null,
      recurringServiceClients: 0,
    },
    attention: [],
    portfolio: [],
    activity: [],
    scoreDistribution: distribution,
    quickActions: buildCommandCenterQuickActions(role),
    delivery: {
      activeProjectCount: 0,
      overdueTaskCount: 0,
      overdueMilestoneCount: 0,
      recentlyCompletedCount: 0,
      projects: [],
    },
    dashboard: {
      clients: [],
      scoreDistribution: distribution,
      generatedAt: "2026-11-06T00:00:00.000Z",
      kpis: {
        averageStackScore: null,
        averageRating: null,
        portfolioScoreTrend: null,
        immediateFocusTotal: 0,
        openRecommendationsCount: 0,
        criticalRecommendationsCount: 0,
        activeProjectsCount: 0,
        atRiskClientCount: 0,
        clientsImprovingCount: 0,
        clientsDecliningCount: 0,
        assessedClientCount: 0,
        totalClientCount: 0,
      },
    },
  };
}

describe("Command Center visual summaries", () => {
  it("renders honest empty states without invalid chart geometry", () => {
    const html = renderToStaticMarkup(
      createElement(DashboardView, { summary: summary() }),
    );
    expect(html).toContain("No assessed clients");
    expect(html).toContain("No active projects");
    expect(html).toContain("Nothing requires attention right now");
    expect(html).not.toMatch(/NaN|Infinity/);
  });
  it("keeps a zero official score distinct from unavailable, with distribution labels", () => {
    const data = summary();
    data.dashboard.kpis.averageStackScore = 0;
    data.scoreDistribution.critical = 1;
    const html = renderToStaticMarkup(
      createElement(PortfolioHealth, { summary: data }),
    );
    expect(html).toContain("Average official StackScore 0 out of 100");
    expect(html).toContain("Critical Risk: 1 client");
    expect(html).toContain("100%");
  });
  it("uses saved task completion, preserves project links and shows unavailable progress honestly", () => {
    const data = summary();
    data.delivery.projects = [0, null, 75].map((progressPercent, i) => ({
      projectId: String(i),
      title: `Project ${i}`,
      clientId: "c1",
      clientName: "Example",
      status: "in_progress",
      progressPercent,
      overdueTaskCount: 0,
      upcomingMilestoneLabel: null,
      href: `/clients/c1/projects/${i}`,
      targetCompletionDate: null,
    }));
    const html = renderToStaticMarkup(
      createElement(DashboardView, { summary: data }),
    );
    expect(html).toContain('aria-valuenow="0"');
    expect(html).toContain('aria-valuenow="75"');
    expect(html).toContain("No tasks recorded yet");
    expect(html).toContain('href="/clients/c1/projects/2"');
    expect((html.match(/role="progressbar"/g) || []).length).toBe(2);
  });
  it("keeps lead metrics and portfolio admin shortcuts out of technician views", () => {
    const html = renderToStaticMarkup(
      createElement(DashboardView, { summary: summary("technician") }),
    );
    expect(html).not.toContain("Open Intake Leads");
    expect(html).not.toContain('href="/leads"');
    expect(html).not.toContain('href="/portfolio"');
    expect(html).toContain('href="/clients"');
  });
});
