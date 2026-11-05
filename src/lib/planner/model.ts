import { z } from "zod";

export const PLANNER_PILLARS = [
  { code: "identity_access", name: "Identity & Access" },
  { code: "endpoint_management", name: "Endpoint Management" },
  { code: "network_connectivity", name: "Network & Connectivity" },
  { code: "data_protection_recovery", name: "Data Protection & Recovery" },
  { code: "productivity_collaboration", name: "Productivity & Collaboration" },
  { code: "security_operations", name: "Security Operations" },
  { code: "documentation_knowledge", name: "Documentation & Knowledge" },
  { code: "technology_strategy", name: "Technology Strategy" },
] as const;
export const HORIZONS = { now: "Now", next: "Next", later: "Later" } as const;
export const STATUSES = {
  planned: "Planned",
  in_progress: "In progress",
  blocked: "Blocked",
  complete: "Complete",
} as const;
const pillarCode = z
  .string()
  .refine(
    (value) => PLANNER_PILLARS.some((p) => p.code === value),
    "Choose a valid pillar",
  )
  .nullable();
export const plannerTaskSchema = z
  .object({
    sourceRecommendationId: z.string().uuid().nullable().optional(),
    title: z.string().trim().min(1, "Give your task a title").max(200),
    description: z.string().trim().max(5000).default(""),
    owner: z.string().trim().max(200).default(""),
    pillarCode: pillarCode.default(null),
    horizon: z.enum(["now", "next", "later"]).default("now"),
    status: z
      .enum(["planned", "in_progress", "blocked", "complete"])
      .default("planned"),
    dueDate: z.iso.date().nullable().default(null),
    steps: z.string().trim().max(10000).default(""),
  })
  .strict();
export const plannerTaskPatchSchema = z
  .object({
    title: plannerTaskSchema.shape.title.optional(),
    description: plannerTaskSchema.shape.description.removeDefault().optional(),
    owner: plannerTaskSchema.shape.owner.removeDefault().optional(),
    pillarCode: plannerTaskSchema.shape.pillarCode.removeDefault().optional(),
    horizon: plannerTaskSchema.shape.horizon.removeDefault().optional(),
    status: plannerTaskSchema.shape.status.removeDefault().optional(),
    dueDate: plannerTaskSchema.shape.dueDate.removeDefault().optional(),
    steps: plannerTaskSchema.shape.steps.removeDefault().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, "No changes provided");
export type PlannerTaskInput = z.infer<typeof plannerTaskSchema>;
export type PlannerTaskView = PlannerTaskInput & { id: string };
export function summarizePlanner(
  tasks: Pick<PlannerTaskView, "status" | "pillarCode">[],
) {
  const complete = tasks.filter((t) => t.status === "complete").length;
  return {
    total: tasks.length,
    complete,
    open: tasks.length - complete,
    progress: tasks.length ? Math.round((100 * complete) / tasks.length) : 0,
    pillars: PLANNER_PILLARS.map((p) => {
      const related = tasks.filter((t) => t.pillarCode === p.code);
      const done = related.filter((t) => t.status === "complete").length;
      return {
        ...p,
        total: related.length,
        complete: done,
        progress: related.length
          ? Math.round((100 * done) / related.length)
          : null,
      };
    }),
  };
}
