import type { SessionUser } from "@/lib/api/helpers";
import { requireAdmin } from "@/lib/api/helpers";

export function requireCommunicationsAdmin(user: SessionUser) {
  return requireAdmin(user);
}

export function assertCommunicationsAdminRole(role: string | undefined): boolean {
  return role === "admin";
}
