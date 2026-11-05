import { describe, expect, it } from "vitest";
import {
  plannerTaskSchema,
  plannerTaskPatchSchema,
  summarizePlanner,
} from "@/lib/planner/model";

describe("improvement planner", () => {
  it("validates dates and prevents unsupported statuses, pillars, and injected tenant fields", () => {
    expect(plannerTaskSchema.parse({ title: "  Test restore  " }).title).toBe(
      "Test restore",
    );
    for (const fields of [
      { dueDate: "2026-02-30" },
      { status: "done" },
      { pillarCode: "made_up" },
      { clientId: "other-client" },
      { title: " " },
    ]) {
      expect(
        plannerTaskSchema.safeParse({ title: "Action", ...fields }).success,
      ).toBe(false);
    }
    expect(plannerTaskPatchSchema.safeParse({}).success).toBe(false);
    expect(plannerTaskPatchSchema.parse({ status: "blocked" })).toEqual({
      status: "blocked",
    });
  });
  it("updates action completion and reverses it when reopened without treating empty pillars as assessed", () => {
    const tasks = [
      { status: "complete" as const, pillarCode: "identity_access" },
      { status: "blocked" as const, pillarCode: "identity_access" },
      { status: "in_progress" as const, pillarCode: "security_operations" },
    ];
    const summary = summarizePlanner(tasks);
    expect(summary).toMatchObject({
      total: 3,
      complete: 1,
      open: 2,
      progress: 33,
    });
    expect(
      summary.pillars.find((p) => p.code === "identity_access"),
    ).toMatchObject({ progress: 50, complete: 1, total: 2 });
    expect(
      summary.pillars.find((p) => p.code === "endpoint_management")?.progress,
    ).toBeNull();
    expect(
      summarizePlanner(tasks.map((t) => ({ ...t, status: "planned" })))
        .progress,
    ).toBe(0);
    expect(summarizePlanner([])).toMatchObject({ progress: 0, total: 0 });
  });
});
