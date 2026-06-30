import { describe, expect, it } from "vitest";
import {
  DASHBOARD_ACTIVE_PROJECT_STATUSES,
  isDashboardActiveProjectStatus,
} from "@/lib/dashboard/active-projects";
import type { ProjectStatus } from "@/generated/prisma/client";

describe("dashboard active projects KPI", () => {
  it("includes approved, scheduled, and in_progress", () => {
    expect(isDashboardActiveProjectStatus("approved")).toBe(true);
    expect(isDashboardActiveProjectStatus("scheduled")).toBe(true);
    expect(isDashboardActiveProjectStatus("in_progress")).toBe(true);
  });

  it("includes proposed projects created from recommendations", () => {
    expect(isDashboardActiveProjectStatus("proposed")).toBe(true);
    expect(DASHBOARD_ACTIVE_PROJECT_STATUSES).toContain("proposed");
  });

  it("excludes completed and cancelled projects", () => {
    expect(isDashboardActiveProjectStatus("completed")).toBe(false);
    expect(isDashboardActiveProjectStatus("cancelled")).toBe(false);
  });

  it("uses lowercase snake_case status values matching Prisma", () => {
    const statuses: ProjectStatus[] = [
      "proposed",
      "approved",
      "scheduled",
      "in_progress",
      "completed",
      "cancelled",
    ];
    for (const status of DASHBOARD_ACTIVE_PROJECT_STATUSES) {
      expect(statuses).toContain(status);
    }
  });
});
