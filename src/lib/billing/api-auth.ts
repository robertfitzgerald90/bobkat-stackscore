import type { UserRole } from "@/generated/prisma/client";
import {
  getSessionUserWithClient,
  isStaffRole,
  requireClientWorkspaceAccess,
} from "@/lib/api/access";
import { unauthorized, forbidden } from "@/lib/api/helpers";
import { canManageBilling } from "@/lib/billing/access";

export async function requireBillingSession() {
  const user = await getSessionUserWithClient();
  if (!user) return { error: unauthorized() } as const;
  return { user } as const;
}

export async function requireBillingClientAccess(clientId: string) {
  const session = await requireBillingSession();
  if ("error" in session) return session;

  const denied = await requireClientWorkspaceAccess(session.user, clientId);
  if (denied) return { error: denied } as const;

  return session;
}

export async function requireBillingManagement(clientId: string) {
  const session = await requireBillingClientAccess(clientId);
  if ("error" in session) return session;

  if (!canManageBilling(session.user.role as UserRole)) {
    return { error: forbidden() } as const;
  }

  return session;
}

export function isStaff(user: { role: UserRole }) {
  return isStaffRole(user.role);
}
