import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  badRequest,
  getSessionUser,
  notFound,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import { sendProjectCustomerUpdate } from "@/lib/projects/customer-update-service";

type RouteContext = { params: Promise<{ id: string; updateId: string }> };

const sendSchema = z.object({
  confirm: z.literal(true),
  /** Staging validation only — never publishes to customer portal. */
  isTest: z.boolean().optional(),
});

export async function POST(request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id, updateId } = await context.params;
  const body = await request.json().catch(() => ({}));
  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Send requires confirm: true");
  }

  const result = await sendProjectCustomerUpdate({
    projectId: id,
    updateId,
    actorUserId: user.id,
    isTest: parsed.data.isTest,
  });
  if (!result) return notFound("Update not found");
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, update: result.update ?? null },
      { status: 400 },
    );
  }

  return NextResponse.json({
    update: result.update,
    messageId: result.messageId,
    providerStatus: result.providerStatus,
    deliveredConfirmed: result.deliveredConfirmed,
  });
}
