import type { UserRole } from "@/generated/prisma/client";
import { canAccessPortfolio } from "@/lib/navigation/default-landing";
import { isCustomerMode, isConsultantMode } from "@/lib/navigation/portal-mode";
import type { CommandPermissions, PageContext } from "@/lib/command-center/types";

export function canAccessCommand(
  permissions: CommandPermissions | undefined,
  context: PageContext,
): boolean {
  if (!permissions) return true;

  const role = context.role as UserRole;

  if (permissions.clientHidden && isCustomerMode(role)) {
    return false;
  }

  if (permissions.roles && !permissions.roles.includes(role)) {
    return false;
  }

  if (permissions.adminOnly && role !== "admin") {
    return false;
  }

  if (permissions.staffOnly && !isConsultantMode(role)) {
    return false;
  }

  if (permissions.portfolioOnly && !canAccessPortfolio(role)) {
    return false;
  }

  if (permissions.requiresClient) {
    const clientId = context.clientId ?? context.userClientId;
    if (!clientId) return false;
  }

  return true;
}
