import { NextRequest, NextResponse } from "next/server";
import {
  badRequest,
  getSessionUser,
  notFound,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import { getCampaignDetail, updateCampaign } from "@/lib/communications/outreach/campaigns";
import { getCampaignTimeline } from "@/lib/communications/outreach/campaign-sync";
import type { CommunicationCampaignStatus } from "@/generated/prisma/client";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id } = await context.params;
  const campaign = await getCampaignDetail(id);
  if (!campaign) return notFound("Campaign not found");

  const timeline = await getCampaignTimeline(id);

  return NextResponse.json({ campaign, timeline });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  if (!body) return badRequest("Invalid request body");

  const existing = await getCampaignDetail(id);
  if (!existing) return notFound("Campaign not found");

  const campaign = await updateCampaign(id, {
    name: body.name !== undefined ? String(body.name) : undefined,
    description: body.description !== undefined ? String(body.description) : undefined,
    status: body.status as CommunicationCampaignStatus | undefined,
    templateKey: body.templateKey ? String(body.templateKey) : undefined,
  });

  return NextResponse.json(campaign);
}
