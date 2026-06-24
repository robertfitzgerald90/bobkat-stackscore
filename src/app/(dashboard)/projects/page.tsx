import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { ProjectsDashboard } from "@/components/projects/projects-dashboard";
import { OPEN_PROJECT_STATUSES } from "@/lib/projects";
import { projectInclude, serializeProject } from "@/lib/projects/serialize";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: projectInclude,
  });

  const serialized = projects.map(serializeProject);

  const byStatus = serialized.reduce(
    (acc, project) => {
      acc[project.status] = (acc[project.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const byClientMap = serialized.reduce(
    (acc, project) => {
      const key = project.clientId;
      if (!acc[key]) {
        acc[key] = { clientId: project.clientId, clientName: project.clientName, count: 0 };
      }
      acc[key].count += 1;
      return acc;
    },
    {} as Record<string, { clientId: string; clientName: string; count: number }>,
  );

  const summary = {
    total: serialized.length,
    open: serialized.filter((p) => OPEN_PROJECT_STATUSES.includes(p.status)).length,
    completed: serialized.filter((p) => p.status === "completed").length,
    byStatus,
    byClient: Object.values(byClientMap).sort((a, b) => a.clientName.localeCompare(b.clientName)),
  };

  return (
    <Suspense>
      <ProjectsDashboard initialProjects={serialized} summary={summary} />
    </Suspense>
  );
}
