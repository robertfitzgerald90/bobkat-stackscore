"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Mail,
  MailOpen,
  MousePointerClick,
  Send,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { eventTypeLabel } from "@/lib/communications/tracking/status";

export type TimelineEventItem = {
  id: string;
  eventType: string;
  source: string;
  occurredAt: string;
  url?: string | null;
  linkLabel?: string | null;
  description?: string | null;
};

type CommunicationDeliveryTimelineProps = {
  events: TimelineEventItem[];
};

const EVENT_ICONS: Record<string, typeof Mail> = {
  MESSAGE_CREATED: Clock3,
  QUEUED: Clock3,
  SENT: Send,
  DELIVERED: CheckCircle2,
  DELAYED: AlertTriangle,
  OPENED: MailOpen,
  CLICKED: MousePointerClick,
  BOUNCED: XCircle,
  FAILED: XCircle,
  COMPLAINED: AlertTriangle,
  CANCELLED: XCircle,
};

export function CommunicationDeliveryTimeline({ events }: CommunicationDeliveryTimelineProps) {
  const grouped = useMemo(() => groupEvents(events), [events]);

  return (
    <div className="space-y-4">
      {grouped.map((group) =>
        group.collapsed ? (
          <CollapsedEventGroup key={group.key} group={group} />
        ) : (
          <TimelineRow key={group.events[0].id} event={group.events[0]} />
        ),
      )}
    </div>
  );
}

function TimelineRow({ event }: { event: TimelineEventItem }) {
  const Icon = EVENT_ICONS[event.eventType] ?? Mail;
  return (
    <div className="flex gap-4 rounded-xl border border-[#1e3a5f]/10 bg-[#082F5B]/[0.02] p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#082F5B]/10 text-[#082F5B]">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-medium text-foreground">{eventTypeLabel(event.eventType)}</p>
          <span className="text-xs text-muted-foreground">
            {new Date(event.occurredAt).toLocaleString()}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Source: {event.source}</p>
        {event.linkLabel || event.url ? (
          <p className="mt-1 text-sm text-secondary-token">
            {event.linkLabel ?? "Link"} {event.url ? `· ${event.url}` : ""}
          </p>
        ) : null}
        {event.description ? (
          <p className="mt-1 text-sm text-secondary-token">{event.description}</p>
        ) : null}
      </div>
    </div>
  );
}

function CollapsedEventGroup({
  group,
}: {
  group: { key: string; events: TimelineEventItem[]; label: string };
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = EVENT_ICONS[group.events[0].eventType] ?? Mail;

  return (
    <div className="rounded-xl border border-[#1e3a5f]/10">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center gap-4 p-4 text-left"
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#082F5B]/10 text-[#082F5B]">
          <Icon className="size-4" />
        </div>
        <div className="flex-1">
          <p className="font-medium">{group.label}</p>
          <p className="text-sm text-muted-foreground">
            Last {new Date(group.events[group.events.length - 1].occurredAt).toLocaleString()}
          </p>
        </div>
        <span className="text-sm text-[#082F5B]">{expanded ? "Hide" : "Show all"}</span>
      </button>
      {expanded ? (
        <div className="space-y-2 border-t border-[#1e3a5f]/10 p-4">
          {group.events.map((event) => (
            <TimelineRow key={event.id} event={event} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function groupEvents(events: TimelineEventItem[]) {
  const result: Array<{
    key: string;
    events: TimelineEventItem[];
    collapsed: boolean;
    label: string;
  }> = [];

  let openBuffer: TimelineEventItem[] = [];

  for (const event of events) {
    if (event.eventType === "OPENED") {
      openBuffer.push(event);
      continue;
    }

    if (openBuffer.length > 1) {
      result.push({
        key: `open-${openBuffer[0].id}`,
        events: openBuffer,
        collapsed: true,
        label: `Opened ${openBuffer.length} times`,
      });
    } else if (openBuffer.length === 1) {
      result.push({
        key: openBuffer[0].id,
        events: openBuffer,
        collapsed: false,
        label: "",
      });
    }
    openBuffer = [];

    result.push({
      key: event.id,
      events: [event],
      collapsed: false,
      label: "",
    });
  }

  if (openBuffer.length > 1) {
    result.push({
      key: `open-${openBuffer[0].id}`,
      events: openBuffer,
      collapsed: true,
      label: `Opened ${openBuffer.length} times`,
    });
  } else if (openBuffer.length === 1) {
    result.push({
      key: openBuffer[0].id,
      events: openBuffer,
      collapsed: false,
      label: "",
    });
  }

  return result;
}

export function OpenTrackingNotice() {
  return (
    <p className={cn("rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900")}>
      Open tracking may be unreliable because many email clients block or proxy tracking pixels.
      Treat clicks and in-application actions as stronger engagement signals.
    </p>
  );
}
