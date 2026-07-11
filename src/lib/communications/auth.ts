import type { SessionUser } from "@/lib/api/helpers";
import { requireAdmin, requireConsultantOrAdmin } from "@/lib/api/helpers";

export function requireCommunicationsAccess(user: SessionUser) {
  return requireConsultantOrAdmin(user);
}

export function requireCommunicationsAdmin(user: SessionUser) {
  return requireAdmin(user);
}

export function assertCommunicationsAccessRole(role: string | undefined): boolean {
  return role === "admin" || role === "technician";
}

export function assertCommunicationsAdminRole(role: string | undefined): boolean {
  return role === "admin";
}
