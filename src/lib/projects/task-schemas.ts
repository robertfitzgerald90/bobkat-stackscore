import { z } from "zod";

export const projectTaskStatusSchema = z.enum([
  "not_started",
  "in_progress",
  "completed",
]);

export const createProjectTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(5000).optional().nullable(),
  internalNotes: z.string().max(5000).optional().nullable(),
  status: projectTaskStatusSchema.optional(),
  dueDate: z.string().datetime().optional().nullable(),
  sortOrder: z.number().int().min(0).max(10_000).optional(),
});

export const updateProjectTaskSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  internalNotes: z.string().max(5000).optional().nullable(),
  status: projectTaskStatusSchema.optional(),
  dueDate: z.string().datetime().optional().nullable(),
  sortOrder: z.number().int().min(0).max(10_000).optional(),
});

export const reorderProjectItemsSchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1).max(200),
});

export const createProjectMilestoneSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(5000).optional().nullable(),
  targetDate: z.string().datetime().optional().nullable(),
  sortOrder: z.number().int().min(0).max(10_000).optional(),
  completed: z.boolean().optional(),
});

export const updateProjectMilestoneSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  targetDate: z.string().datetime().optional().nullable(),
  sortOrder: z.number().int().min(0).max(10_000).optional(),
  completed: z.boolean().optional(),
});

export const linkProjectRecommendationSchema = z.object({
  recommendationId: z.string().uuid(),
});

export type CreateProjectTaskInput = z.infer<typeof createProjectTaskSchema>;
export type UpdateProjectTaskInput = z.infer<typeof updateProjectTaskSchema>;
export type CreateProjectMilestoneInput = z.infer<typeof createProjectMilestoneSchema>;
export type UpdateProjectMilestoneInput = z.infer<typeof updateProjectMilestoneSchema>;
