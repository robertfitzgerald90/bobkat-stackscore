import { NextResponse } from "next/server";
import {
  getSessionUser,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import {
  listPendingQueueItems,
  sendQueueItem,
  dismissQueueItem,
} from "@/lib/communications/queue/service";
import {
  actOnQuarterlyReviewReminder,
  listQuarterlyReviewReminders,
} from "@/lib/communications/quarterly-review/reminders";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const [queueItems, quarterlyReminders] = await Promise.all([
    listPendingQueueItems(),
    listQuarterlyReviewReminders(),
  ]);

  return NextResponse.json({ queueItems, quarterlyReminders });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const body = (await request.json()) as {
    action?: "send" | "approve" | "dismiss" | "schedule" | "delay";
    queueItemId?: string;
    reminderId?: string;
    scheduledFor?: string;
    dismissReason?: string;
  };

  if (body.reminderId && body.action) {
    try {
      const reminder = await actOnQuarterlyReviewReminder({
        reminderId: body.reminderId,
        action:
          body.action === "send"
            ? "send"
            : body.action === "schedule"
              ? "schedule"
              : body.action === "delay"
                ? "delay"
                : "dismiss",
        actorUserId: user.id,
        scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : undefined,
        dismissReason: body.dismissReason,
      });
      return NextResponse.json({ reminder });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Unable to update reminder" },
        { status: 400 },
      );
    }
  }

  if (!body.queueItemId || !body.action) {
    return NextResponse.json({ error: "queueItemId and action are required" }, { status: 400 });
  }

  if (body.action === "send" || body.action === "approve") {
    const item = await sendQueueItem(body.queueItemId, user.id);
    return NextResponse.json({ item });
  }

  if (body.action === "dismiss") {
    const item = await dismissQueueItem(body.queueItemId);
    return NextResponse.json({ item });
  }

  return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
}
