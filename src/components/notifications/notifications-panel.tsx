"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Bell, Loader2 } from "lucide-react";
import type { OperationalNotificationView } from "@/lib/notifications";
import { buttonClassName } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-[#082f5b]" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#082f5b]">
            Actionable Notifications
          </h2>
        </div>
        <button
          type="button"
          className={buttonClassName({ variant: "outline", size: "sm" })}
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
        <ul className="mt-4 space-y-2">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={cn(
                "rounded-lg border px-3 py-3 text-sm",
                !notification.readAt && "bg-slate-50",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{notification.title}</p>
                  <p className="mt-1 text-muted-foreground">{notification.body}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                    {notification.category.replaceAll("_", " ")} · {notification.severity}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {notification.actionHref ? (
                    <Link
                      href={notification.actionHref}
                      className={buttonClassName({ variant: "secondary", size: "sm" })}
                      onClick={() => void markRead(notification.id)}
                    >
                      {notification.actionLabel ?? "Open"}
                    </Link>
                  ) : null}
                  {!notification.readAt ? (
                    <button
                      type="button"
                      className={buttonClassName({ variant: "ghost", size: "sm" })}
                      onClick={() => void markRead(notification.id)}
                    >
                      Mark read
                    </button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
