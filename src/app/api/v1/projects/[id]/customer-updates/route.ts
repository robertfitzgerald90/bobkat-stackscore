import { NextRequest, NextResponse } from "next/server";
import {
  getSessionUser,
  notFound,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import {
  listProjectCustomerUpdates,
  prepareProjectCustomerUpdate,
} from "@/lib/projects/customer-update-service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id } = await context.params;
  const updates = await listProjectCustomerUpdates(id);
  return NextResponse.json({ updates });
}

export async function POST(_request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id } = await context.params;
  const update = await prepareProjectCustomerUpdate(id, user.id);
  if (!update) return notFound("Project not found");
  return NextResponse.json(update, { status: 201 });
}
