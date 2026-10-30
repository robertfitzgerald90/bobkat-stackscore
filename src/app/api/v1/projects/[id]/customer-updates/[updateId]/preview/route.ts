import { NextRequest, NextResponse } from "next/server";
import {
  badRequest,
  getSessionUser,
  notFound,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import { previewProjectCustomerUpdate } from "@/lib/projects/customer-update-service";

type RouteContext = { params: Promise<{ id: string; updateId: string }> };

export async function POST(_request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id, updateId } = await context.params;
  const result = await previewProjectCustomerUpdate(id, updateId);
  if (!result) return notFound("Update not found");
  if (!result.ok) return badRequest(result.error);
  return NextResponse.json(result.preview);
}
