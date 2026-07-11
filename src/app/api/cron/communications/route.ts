import { NextResponse } from "next/server";
import { scanQuarterlyReviewReminders } from "@/lib/communications/quarterly-review/reminders";
import { processDueScheduledQueueItems } from "@/lib/communications/queue/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  const [reminders, scheduled] = await Promise.all([
    scanQuarterlyReviewReminders(),
    processDueScheduledQueueItems(),
  ]);

  return NextResponse.json({
    ok: true,
    reminders,
    scheduledProcessed: scheduled,
    elapsedMs: Date.now() - startedAt,
  });
}
