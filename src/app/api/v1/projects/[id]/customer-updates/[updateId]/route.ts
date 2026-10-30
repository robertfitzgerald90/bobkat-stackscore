import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  badRequest,
  getSessionUser,
  notFound,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import {
  cancelProjectCustomerUpdate,
  getProjectCustomerUpdate,
  updateProjectCustomerUpdateDraft,
} from "@/lib/projects/customer-update-service";

type RouteContext = { params: Promise<{ id: string; updateId: string }> };

const patchSchema = z.object({
  staffMessage: z.string().max(5000).optional(),
  includeProjectStatus: z.boolean().optional(),
  includeWorkCompleted: z.boolean().optional(),
  includeInProgress: z.boolean().optional(),
  includeComingNext: z.boolean().optional(),
  includeStaffMessage: z.boolean().optional(),
  excludedItemIds: z.array(z.string().min(1)).optional(),
  includedItemIds: z.array(z.string().min(1)).optional(),
  cancel: z.boolean().optional(),
});

export async function GET(_request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id, updateId } = await context.params;
  const update = await getProjectCustomerUpdate(id, updateId);
  if (!update) return notFound("Update not found");
  return NextResponse.json(update);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id, updateId } = await context.params;
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid update");
  }

  if (parsed.data.cancel) {
    const result = await cancelProjectCustomerUpdate(id, updateId);
    if (!result) return notFound("Update not found");
    if (!result.ok) return badRequest(result.error);
    return NextResponse.json(result.update);
  }

  const result = await updateProjectCustomerUpdateDraft(id, updateId, parsed.data);
  if (!result) return notFound("Update not found");
  if (!result.ok) return badRequest(result.error);
  return NextResponse.json(result.update);
}
