import type { InvoiceStatus } from "@/generated/prisma/client";

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  ready_to_send: "Ready to Send",
  sent: "Sent",
  viewed: "Viewed",
  partially_paid: "Partially Paid",
  paid: "Paid",
  overdue: "Overdue",
  voided: "Voided",
  refunded: "Refunded",
};

export const INVOICE_STATUS_VARIANT: Record<
  InvoiceStatus,
  "default" | "secondary" | "success" | "destructive" | "warning" | "outline"
> = {
  draft: "secondary",
  ready_to_send: "outline",
  sent: "default",
  viewed: "default",
  partially_paid: "warning",
  paid: "success",
  overdue: "destructive",
  voided: "secondary",
  refunded: "outline",
};
