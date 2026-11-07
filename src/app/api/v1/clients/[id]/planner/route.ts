import { isClientDeliverableRecommendation } from "@/lib/recommendations/visibility";
import { NextResponse } from "next/server";
import {
  getSessionUserWithClient,
  requireClientWorkspaceAccess,
} from "@/lib/api/access";
import { badRequest, notFound, unauthorized } from "@/lib/api/helpers";
import { prisma } from "@/lib/db";
import { plannerTaskSchema } from "@/lib/planner/model";
import { listPlannerTasks } from "@/lib/planner/service";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
async function access(context: Context) {
  const user = await getSessionUserWithClient();
  if (!user) return { response: unauthorized() };
  const { id } = await context.params;
  const denied = await requireClientWorkspaceAccess(user, id);
  if (denied) return { response: denied };
  if (
    !(await prisma.client.findUnique({ where: { id }, select: { id: true } }))
  )
    return { response: notFound("Workspace not found") };
  return { id, role: user.role };
}
export async function GET(_request: Request, context: Context) {
  const result = await access(context);
  if (result.response) return result.response;
  return NextResponse.json({ tasks: await listPlannerTasks(result.id!) });
}
export async function POST(request: Request, context: Context) {
  const result = await access(context);
  if (result.response) return result.response;
  const parsed = plannerTaskSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid task");
  if (parsed.data.sourceRecommendationId) {
    const source = await prisma.assessmentRecommendation.findFirst({
      where: { id: parsed.data.sourceRecommendationId, clientId: result.id! },
      include: { recommendationTemplate: { select: { code: true } } },
    });
    if (!source || !isClientDeliverableRecommendation(source, result.role!))
      return notFound("Recommendation not found");
    const { sourceRecommendationId, ...values } = parsed.data;
    const task = await prisma.plannerTask.upsert({
      where: {
        clientId_sourceRecommendationId: {
          clientId: result.id!,
          sourceRecommendationId,
        },
      },
      create: { ...values, clientId: result.id!, sourceRecommendationId },
      update: {},
    });
    return NextResponse.json({ task }, { status: 201 });
  }
  const task = await prisma.plannerTask.create({
    data: { ...parsed.data, clientId: result.id! },
  });
  return NextResponse.json({ task }, { status: 201 });
}
