import type {
  CommunicationEventType,
  CommunicationMessageStatus,
} from "@/generated/prisma/client";

export const RESEND_EVENT_TYPE_MAP: Record<string, CommunicationEventType> = {
  "email.sent": "SENT",
  "email.delivered": "DELIVERED",
  "email.delivery_delayed": "DELAYED",
  "email.opened": "OPENED",
  "email.clicked": "CLICKED",
  "email.bounced": "BOUNCED",
  "email.complained": "COMPLAINED",
  "email.failed": "FAILED",
};

const STATUS_PRIORITY: CommunicationMessageStatus[] = [
  "DRAFT",
  "QUEUED",
  "SENT",
  "DELAYED",
  "DELIVERED",
  "OPENED",
  "CLICKED",
  "BOUNCED",
  "FAILED",
  "COMPLAINED",
  "CANCELLED",
];

export function deriveStatusFromEvent(
  current: CommunicationMessageStatus,
  eventType: CommunicationEventType,
): CommunicationMessageStatus {
  if (eventType === "BOUNCED") return "BOUNCED";
  if (eventType === "FAILED") return "FAILED";
  if (eventType === "COMPLAINED") return "COMPLAINED";
  if (eventType === "CANCELLED") return "CANCELLED";
  if (eventType === "CLICKED") return "CLICKED";
  if (eventType === "OPENED") return "OPENED";
  if (eventType === "DELIVERED") return "DELIVERED";
  if (eventType === "DELAYED") return "DELAYED";
  if (eventType === "SENT") return "SENT";

  const currentIndex = STATUS_PRIORITY.indexOf(current);
  const eventAsStatus = eventType as CommunicationMessageStatus;
  const eventIndex = STATUS_PRIORITY.indexOf(eventAsStatus);
  if (eventIndex >= 0 && eventIndex > currentIndex) {
    return eventAsStatus;
  }
  return current;
}

export function eventTypeLabel(eventType: CommunicationEventType | string): string {
  const labels: Record<string, string> = {
    MESSAGE_CREATED: "Message created",
    QUEUED: "Queued",
    SENT: "Sent",
    DELIVERED: "Delivered",
    DELAYED: "Delivery delayed",
    OPENED: "Opened",
    CLICKED: "Link clicked",
    BOUNCED: "Bounced",
    FAILED: "Failed",
    COMPLAINED: "Spam complaint",
    CANCELLED: "Cancelled",
  };
  return labels[eventType] ?? eventType;
}

export function statusLabel(status: CommunicationMessageStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}
