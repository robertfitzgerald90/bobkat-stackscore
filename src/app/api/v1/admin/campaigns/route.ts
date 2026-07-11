import { NextRequest, NextResponse } from "next/server";
import {
  badRequest,
  getSessionUser,
  paginatedResponse,
  parsePagination,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import {
  createCampaign,
  listCampaigns,
} from "@/lib/communications/outreach/campaigns";
import type { CommunicationCampaignStatus } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const { page, limit } = parsePagination(searchParams);
  const status = searchParams.get("status") as CommunicationCampaignStatus | null;
  const search = searchParams.get("search") ?? undefined;

  const result = await listCampaigns({
    page,
    limit,
    status: status ?? undefined,
    search,
  });

  return paginatedResponse(result.items, result.total, page, limit);
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  if (!body?.name?.trim()) return badRequest("Campaign name is required");

  const campaign = await createCampaign({
    name: String(body.name),
    description: body.description ? String(body.description) : null,
    templateKey: body.templateKey ? String(body.templateKey) : "EMAIL-009",
    status: body.status ?? "draft",
    createdByUserId: user.id,
  });

  return NextResponse.json(campaign, { status: 201 });
}
