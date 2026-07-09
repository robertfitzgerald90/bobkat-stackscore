import type { UserRole } from "@/generated/prisma/client";

export type PortalMode = "customer" | "consultant";

/** Customer portal — purchased assessment experience (role: client). */
export function isCustomerMode(role: UserRole | string): boolean {
  return role === "client";
}

/** Consultant portal — staff operating system (admin + technician). */
export function isConsultantMode(role: UserRole | string): boolean {
  return role === "admin" || role === "technician";
}

export function resolvePortalMode(role: UserRole | string): PortalMode {
  return isCustomerMode(role) ? "customer" : "consultant";
}
