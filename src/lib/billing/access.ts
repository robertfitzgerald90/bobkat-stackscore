import type { Invoice, UserRole } from "@/generated/prisma/client";

function isStaffRole(role: UserRole): boolean {
  return role === "admin" || role === "technician";
}

/** Invoice statuses visible to client portal users. */
export const CLIENT_VISIBLE_INVOICE_STATUSES = new Set([
  "sent",
  "viewed",
  "partially_paid",
  "paid",
  "overdue",
  "refunded",
]);

export function canManageBilling(role: UserRole): boolean {
  return isStaffRole(role);
}

export function canClientViewInvoice(role: UserRole, invoice: Pick<Invoice, "status">): boolean {
  if (isStaffRole(role)) return true;
  return CLIENT_VISIBLE_INVOICE_STATUSES.has(invoice.status);
}

export function stripInternalInvoiceFields<T extends Record<string, unknown>>(
  invoice: T,
  isStaff: boolean,
): T {
  if (isStaff) return invoice;
  const { internalNotes: _n, ...rest } = invoice;
  return rest as T;
}

export function stripInternalLineItems<T extends { internalCostCents?: number | null }>(
  items: T[],
  isStaff: boolean,
): T[] {
  if (isStaff) return items;
  return items.map(({ internalCostCents: _c, ...rest }) => rest as T);
}
