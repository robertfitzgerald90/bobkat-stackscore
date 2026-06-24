import type { Priority, ProjectStatus } from "@/generated/prisma/client";

export type SerializedProject = {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  recommendationId: string;
  recommendationTitle: string;
  assessmentId: string;
  priority: Priority;
  estimatedImpactPoints: number | null;
  status: ProjectStatus;
  notes: string | null;
  createdAt: string;
  completedAt: string | null;
  categoryName: string;
  assignedUserName: string | null;
};

type ProjectWithRelations = {
  id: string;
  title: string;
  clientId: string;
  recommendationId: string;
  priority: Priority;
  estimatedImpactPoints: number | null;
  status: ProjectStatus;
  description: string | null;
  createdAt: Date;
  completedAt: Date | null;
  client: { companyName: string };
  category: { name: string };
  assignedUser: { name: string } | null;
  recommendation: {
    id: string;
    title: string;
    assessmentId: string;
  } | null;
};

export function serializeProject(project: ProjectWithRelations): SerializedProject {
  return {
    id: project.id,
    title: project.title,
    clientId: project.clientId,
    clientName: project.client.companyName,
    recommendationId: project.recommendationId,
    recommendationTitle: project.recommendation?.title ?? "—",
    assessmentId: project.recommendation?.assessmentId ?? "",
    priority: project.priority,
    estimatedImpactPoints: project.estimatedImpactPoints,
    status: project.status,
    notes: project.description,
    createdAt: project.createdAt.toISOString(),
    completedAt: project.completedAt?.toISOString() ?? null,
    categoryName: project.category.name,
    assignedUserName: project.assignedUser?.name ?? null,
  };
}

export const projectInclude = {
  client: { select: { companyName: true } },
  category: { select: { name: true } },
  assignedUser: { select: { name: true } },
  recommendation: {
    select: { id: true, title: true, assessmentId: true },
  },
} as const;
