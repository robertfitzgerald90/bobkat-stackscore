import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser, unauthorized } from "@/lib/api/helpers";
import { ACTIVE_PROJECT_STATUSES, OPEN_PROJECT_STATUSES } from "@/lib/projects";
import { projectInclude, serializeProject } from "@/lib/projects/serialize";
import type { ProjectStatus } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const view = searchParams.get("view") ?? undefined;

  let statusFilter: ProjectStatus | ProjectStatus[] | undefined;

  if (status) {
    statusFilter = status as ProjectStatus;
  } else if (view === "open") {
    statusFilter = OPEN_PROJECT_STATUSES;
  } else if (view === "completed") {
    statusFilter = "completed";
  } else if (view === "active") {
    statusFilter = ACTIVE_PROJECT_STATUSES;
  }

  const projects = await prisma.project.findMany({
    where: {
      ...(clientId ? { clientId } : {}),
      ...(statusFilter
        ? Array.isArray(statusFilter)
          ? { status: { in: statusFilter } }
          : { status: statusFilter }
        : {}),
    },
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

  const byClient = serialized.reduce(
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

  return NextResponse.json({
    projects: serialized,
    summary: {
      total: serialized.length,
      open: serialized.filter((p) => OPEN_PROJECT_STATUSES.includes(p.status)).length,
      completed: serialized.filter((p) => p.status === "completed").length,
      byStatus,
      byClient: Object.values(byClient).sort((a, b) =>
        a.clientName.localeCompare(b.clientName),
      ),
    },
  });
}
