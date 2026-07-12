import type { UserRole } from "@/generated/prisma/client";
import { canAccessPortfolio } from "@/lib/navigation/default-landing";
import { isCustomerMode, isConsultantMode } from "@/lib/navigation/portal-mode";
import { canAccessHref } from "@/lib/command-center/route-access";
import type { CommandPermissions, PageContext } from "@/lib/command-center/types";

export function canAccessCommand(
  permissions: CommandPermissions | undefined,
  context: PageContext,
): boolean {
  const role = context.role as UserRole;
  const isClient = isCustomerMode(role);

  if (!permissions) {
    return !isClient;
  }

  if (permissions.clientHidden && isClient) {
    return false;
  }

  if (permissions.clientOnly && !isClient) {
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

export function canExecuteResolvedCommand(
  command: {
    id: string;
    permissions?: CommandPermissions;
    actionId?: string;
    resolvedHref?: string;
  },
  context: PageContext,
): boolean {
  if (!canAccessCommand(command.permissions, context)) {
    return false;
  }

  if (command.actionId) {
    if (isCustomerMode(context.role)) {
      return false;
    }
    return isConsultantMode(context.role);
  }

  if (command.resolvedHref) {
    return canAccessHref(command.resolvedHref, context);
  }

  return false;
}
