"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Bell, Loader2 } from "lucide-react";
import type { OperationalNotificationView } from "@/lib/notifications";
import { CornerBrackets } from "@/components/design-system/instrument/corner-brackets";
import { buttonClassName } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function bracketTone(
  severity: OperationalNotificationView["severity"],
): "measured" | "critical" {
  return severity === "urgent" ? "critical" : "measured";
}

function statusBadgeClass(severity: OperationalNotificationView["severity"]) {
  if (severity === "urgent") {
    return "text-[var(--ember,var(--destructive,#b23a3a))]";
  }
  if (severity === "attention") {
    return "text-primary";
  }
  return "text-muted-foreground";
}

export function NotificationsPanel({
  initialNotifications,
}: {
  initialNotifications: OperationalNotificationView[];
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [pending, startTransition] = useTransition();

  async function refresh() {
    const response = await fetch("/api/v1/notifications?refresh=1");
    const body = (await response.json()) as {
      notifications?: OperationalNotificationView[];
    };
    if (response.ok && body.notifications) {
      setNotifications(body.notifications);
    }
  }

  async function markRead(id: string) {
    await fetch(`/api/v1/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read" }),
    });
    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, readAt: new Date().toISOString() } : item,
      ),
    );
  }

  return (
    <section className="rounded-[var(--radius)] border border-border bg-card p-5 shadow-none">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" aria-hidden />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
            Actionable Notifications
          </h2>
        </div>
        <button
          type="button"
          className={buttonClassName({
            variant: "outline",
            size: "sm",
            className: "rounded-[var(--radius)] shadow-none",
          })}
          disabled={pending}
          onClick={() => startTransition(() => void refresh())}
        >
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Refresh signals
        </button>
      </div>

      {notifications.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No actionable notifications right now.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {notifications.map((notification) => (
            <li key={notification.id}>
              <CornerBrackets tone={bracketTone(notification.severity)} corners="two">
                <div
                  className={cn(
                    "rounded-[var(--radius)] border border-border bg-card px-3 py-3 text-sm shadow-none",
                    !notification.readAt && "bg-accent",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{notification.title}</p>
                      <p className="mt-1 text-muted-foreground">{notification.body}</p>
                      <p
                        className={cn(
                          "instrument-mono mt-2 text-[10px] font-semibold uppercase tracking-[0.14em]",
                          statusBadgeClass(notification.severity),
                        )}
                      >
                        {notification.category.replaceAll("_", " ")} · {notification.severity}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {notification.actionHref ? (
                        <Link
                          href={notification.actionHref}
                          className={buttonClassName({
                            variant: "default",
                            size: "sm",
                            className: "rounded-[var(--radius)] shadow-none",
                          })}
                          onClick={() => void markRead(notification.id)}
                        >
                          {notification.actionLabel ?? "Open"}
                        </Link>
                      ) : null}
                      {!notification.readAt ? (
                        <button
                          type="button"
                          className={buttonClassName({
                            variant: "link",
                            size: "sm",
                            className: "h-auto px-0 text-muted-foreground hover:text-foreground",
                          })}
                          onClick={() => void markRead(notification.id)}
                        >
                          Mark read
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </CornerBrackets>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
