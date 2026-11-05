import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OverviewMaturityProfile } from "@/components/customer-portal/overview/overview-maturity-profile";
import { PLANNER_PILLARS, type PlannerTaskView } from "@/lib/planner/model";
const pillars = PLANNER_PILLARS.map(p => ({ ...p, score: 58, businessQuestion: "Can we improve this area?", maturityLabel: "Developing", href: `/explore/${p.code}`, status: "complete" as const }));
const task: PlannerTaskView = { id: "task", title: "Test recovery", pillarCode: "identity_access", status: "complete", horizon: "now", description: "", owner: "", dueDate: null, steps: "" };
describe("dashboard maturity profile", () => {
  it("renders all assessment pillars and distinguishes completed activity from verified scores", () => {
    const html = renderToStaticMarkup(createElement(OverviewMaturityProfile, { pillars, tasks: [task], clientId: "client-a", assessedAtLabel: "Nov 5, 2026" }));
    expect(html).toContain('role="img"');
    for (const pillar of pillars) expect(html).toContain(pillar.name.replaceAll("&", "&amp;"));
    expect(html).toContain("100%");
    expect(html).toContain("58");
    expect(html).toContain("1 of 1 actions complete");
    expect(html).toContain("not verified maturity");
    expect(html).toContain('/clients/client-a/roadmap');
  });
  it("does not invent a maturity polygon for incomplete assessments or show completion when no actions exist", () => {
    const html = renderToStaticMarkup(createElement(OverviewMaturityProfile, { pillars: pillars.map(p => ({ ...p, score: null, status: "incomplete" })), tasks: [], clientId: "client-a", assessedAtLabel: null }));
    expect(html).not.toContain('fill-opacity="0.12"');
    expect(html).toContain("0 of 0 actions complete");
    expect(html).toContain("Assessment pending");
  });
});
