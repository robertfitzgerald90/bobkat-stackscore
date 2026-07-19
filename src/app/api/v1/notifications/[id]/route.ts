import { NextResponse } from "next/server";
import { getSessionUserWithClient } from "@/lib/api/access";
import { badRequest, unauthorized } from "@/lib/api/helpers";
import { dismissNotification, markNotificationRead } from "@/lib/notifications";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getSessionUserWithClient();
  if (!user) return unauthorized();

  const { id } = await context.params;
  let body: { action?: string };
  try {
    body = (await request.json()) as { action?: string };
  } catch {
    return badRequest("Invalid JSON body");
  }

  if (body.action === "read") {
    await markNotificationRead(user.id, id);
    return NextResponse.json({ ok: true });
  }
  if (body.action === "dismiss") {
    await dismissNotification(user.id, id);
    return NextResponse.json({ ok: true });
  }

  return badRequest("action must be read or dismiss");
}
