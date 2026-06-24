import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser, unauthorized } from "@/lib/api/helpers";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const [totalClients, activeClients, assessmentsThisMonth, recentAssessments, atRiskClients] =
    await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: { status: "active" } }),
      prisma.assessment.count({
        where: {
          status: "completed",
          completedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.assessment.findMany({
        where: { status: "completed" },
        orderBy: { completedAt: "desc" },
        take: 5,
        include: {
          client: { select: { id: true, companyName: true } },
          assessor: { select: { name: true } },
        },
      }),
      prisma.client.findMany({
        where: {
          assessments: {
            some: {
              status: "completed",
              overallScore: { lt: 60 },
            },
          },
        },
        take: 5,
        include: {
          assessments: {
            where: { status: "completed" },
            orderBy: { completedAt: "desc" },
            take: 1,
          },
        },
      }),
    ]);

  const completedScores = await prisma.assessment.findMany({
    where: { status: "completed", overallScore: { not: null } },
    select: { overallScore: true },
  });

  const averageScore =
    completedScores.length > 0
      ? Math.round(
          completedScores.reduce((sum, item) => sum + Number(item.overallScore), 0) /
            completedScores.length,
        )
      : 0;

  return NextResponse.json({
    totalClients,
    activeClients,
    assessmentsThisMonth,
    clientsAtRisk: atRiskClients.length,
    recentAssessments,
    averageScore,
  });
}
