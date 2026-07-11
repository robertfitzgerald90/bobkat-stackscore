"use client";

import { useState } from "react";
import { CalendarClock, Send, XCircle } from "lucide-react";
import { toast } from "sonner";
import { CommunicationsPanel } from "@/components/communications/communications-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type QueueItemSummary = {
  id: string;
  workflowKey: string;
  templateKey: string;
  status: string;
  reviewRequired: boolean;
  createdAt: string;
  client?: { companyName: string | null } | null;
};

export type QuarterlyReminderSummary = {
  id: string;
  status: string;
  dueAt: string;
  client: { companyName: string };
};

type CommunicationsUpcomingActionsProps = {
  queueItems: QueueItemSummary[];
  quarterlyReminders: QuarterlyReminderSummary[];
};

async function postQueueAction(body: Record<string, unknown>) {
  const response = await fetch("/api/v1/admin/communications/queue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error ?? "Action failed");
  }
  return payload;
}

export function CommunicationsUpcomingActions({
  queueItems,
  quarterlyReminders,
}: CommunicationsUpcomingActionsProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleQueueAction(queueItemId: string, action: "send" | "dismiss") {
    setLoadingId(queueItemId);
    try {
      await postQueueAction({ queueItemId, action });
      toast.success(action === "send" ? "Communication sent" : "Communication dismissed");
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update queue item");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleReminderAction(
    reminderId: string,
    action: "send" | "schedule" | "delay" | "dismiss",
  ) {
    setLoadingId(reminderId);
    try {
      await postQueueAction({ reminderId, action });
      toast.success("Quarterly review reminder updated");
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update reminder");
    } finally {
      setLoadingId(null);
    }
  }

  if (queueItems.length === 0 && quarterlyReminders.length === 0) {
    return null;
  }

  return (
    <CommunicationsPanel
      title="Upcoming Actions"
      description="Review queued customer communications and internal quarterly review reminders."
    >
      <div className="space-y-6">
        {quarterlyReminders.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium">Quarterly review reminders</p>
            <ul className="space-y-3">
              {quarterlyReminders.map((reminder) => (
                <li
                  key={reminder.id}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{reminder.client.companyName}</p>
                    <p className="text-sm text-muted-foreground">
                      Due {new Date(reminder.dueAt).toLocaleDateString()}
                    </p>
                    <Badge variant="secondary" className="mt-2 capitalize">
                      {reminder.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      disabled={loadingId === reminder.id}
                      onClick={() => void handleReminderAction(reminder.id, "send")}
                    >
                      <Send className="mr-1 h-4 w-4" />
                      Send
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={loadingId === reminder.id}
                      onClick={() => void handleReminderAction(reminder.id, "schedule")}
                    >
                      <CalendarClock className="mr-1 h-4 w-4" />
                      Schedule
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={loadingId === reminder.id}
                      onClick={() => void handleReminderAction(reminder.id, "delay")}
                    >
                      Delay 30 Days
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={loadingId === reminder.id}
                      onClick={() => void handleReminderAction(reminder.id, "dismiss")}
                    >
                      <XCircle className="mr-1 h-4 w-4" />
                      Dismiss
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {queueItems.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium">Communication queue</p>
            <ul className="space-y-3">
              {queueItems.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{item.client?.companyName ?? "Unknown client"}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.workflowKey.replace(/_/g, " ")} · {item.templateKey}
                    </p>
                    <Badge variant="secondary" className="mt-2 capitalize">
                      {item.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      disabled={loadingId === item.id}
                      onClick={() => void handleQueueAction(item.id, "send")}
                    >
                      <Send className="mr-1 h-4 w-4" />
                      Send
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={loadingId === item.id}
                      onClick={() => void handleQueueAction(item.id, "dismiss")}
                    >
                      Dismiss
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </CommunicationsPanel>
  );
}
