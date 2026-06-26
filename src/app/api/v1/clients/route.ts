import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getSessionUser,
  paginatedResponse,
  parsePagination,
  unauthorized,
} from "@/lib/api/helpers";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const { page, limit, skip } = parsePagination(searchParams);
  const status = searchParams.get("status") ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  const where = {
    ...(status ? { status: status as "prospect" | "active" | "inactive" | "archived" } : {}),
    ...(search
      ? { companyName: { contains: search, mode: "insensitive" as const } }
      : {}),
  };

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip,
      take: limit,
      orderBy: { companyName: "asc" },
      include: {
        assessments: {
          where: { status: "completed" },
          orderBy: { completedAt: "desc" },
          take: 1,
        },
        _count: { select: { assessments: true } },
      },
    }),
    prisma.client.count({ where }),
  ]);

  const data = clients.map((client) => ({
    id: client.id,
    companyName: client.companyName,
    primaryContactName: client.primaryContactName,
    status: client.status,
    latestScore: client.assessments[0]?.overallScore
      ? Number(client.assessments[0].overallScore)
      : null,
    latestRating: client.assessments[0]?.overallScore
      ? getRatingLabel(Number(client.assessments[0].overallScore))
      : null,
    assessmentCount: client._count.assessments,
  }));

  return paginatedResponse(data, total, page, limit);
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const body = await request.json();

  const client = await prisma.client.create({
    data: {
      companyName: body.companyName,
      primaryContactName: body.primaryContactName,
      primaryContactEmail: body.primaryContactEmail,
      primaryContactPhone: body.primaryContactPhone ?? null,
      industry: body.industry ?? null,
      employeeCount: body.employeeCount ?? null,
      deviceCount: body.deviceCount ?? null,
      locationCity: body.locationCity ?? null,
      locationState: body.locationState ?? null,
      status: body.status ?? "prospect",
      notes: body.notes ?? null,
      technologyProfile: { create: {} },
    },
  });

  return NextResponse.json(client, { status: 201 });
}

function getRatingLabel(score: number) {
  if (score >= 90) return "exceptional";
  if (score >= 80) return "strong";
  if (score >= 70) return "stable";
  if (score >= 60) return "at_risk";
  return "critical";
}
