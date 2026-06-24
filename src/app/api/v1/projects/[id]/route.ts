import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  badRequest,
  getSessionUser,
  notFound,
  unauthorized,
} from "@/lib/api/helpers";
import { updateProjectWithWorkflow } from "@/lib/projects/service";
import { projectInclude, serializeProject } from "@/lib/projects/serialize";
import { updateProjectSchema } from "@/lib/projects/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id } = await context.params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: projectInclude,
  });

  if (!project) return notFound("Project not found");

  return NextResponse.json(serializeProject(project));
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id } = await context.params;
  const body = await request.json();
  const parsed = updateProjectSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid project update");
  }

  const project = await updateProjectWithWorkflow(id, parsed.data);
  if (!project) return notFound("Project not found");

  return NextResponse.json(project);
}
