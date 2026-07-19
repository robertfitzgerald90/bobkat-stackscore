import { NextResponse } from "next/server";
import { getSessionUserWithClient } from "@/lib/api/access";
import { unauthorized } from "@/lib/api/helpers";
import {
  listOperationalNotifications,
  refreshConsultantNotifications,
} from "@/lib/notifications";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getSessionUserWithClient();
  if (!user) return unauthorized();

  const refresh = new URL(request.url).searchParams.get("refresh") === "1";
  if (refresh) {
    await refreshConsultantNotifications(user.id, user.role);
  }

  const notifications = await listOperationalNotifications(user.id);
  return NextResponse.json({ notifications });
}
