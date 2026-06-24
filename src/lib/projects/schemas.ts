import { z } from "zod";

export const createProjectSchema = z.object({
  recommendationId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional().nullable(),
  priority: z.enum(["low", "medium", "high", "critical"]),
  categoryId: z.string().uuid(),
  estimatedImpactPoints: z.number().int().min(0).max(100).optional().nullable(),
  assignedUserId: z.string().uuid().optional().nullable(),
  estimatedCost: z.number().min(0).optional().nullable(),
  targetCompletionDate: z.string().datetime().optional().nullable(),
});

export const updateProjectSchema = z.object({
  status: z
    .enum(["proposed", "approved", "scheduled", "in_progress", "completed", "cancelled"])
    .optional(),
  notes: z.string().max(5000).optional().nullable(),
  assignedUserId: z.string().uuid().optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  targetCompletionDate: z.string().datetime().optional().nullable(),
  actualImpactPoints: z.number().int().min(0).max(100).optional().nullable(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
