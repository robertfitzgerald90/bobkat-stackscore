import type { PageContext, RegisteredCommand } from "@/lib/command-center/types";
import { resolveContextualHref } from "@/lib/command-center/modules/communications";
import { canAccessCommand, canExecuteResolvedCommand } from "@/lib/command-center/permissions";
import { canAccessHref } from "@/lib/command-center/route-access";
import {
  filterCommandsForContext,
  getCommandById,
  getRegisteredCommands,
} from "@/lib/command-center/registry";
import { rankByFuzzy } from "@/lib/command-center/fuzzy";
import { isCustomerMode } from "@/lib/navigation/portal-mode";

export type ResolvedCommand = RegisteredCommand & {
  resolvedHref?: string;
};

function resolveHref(command: RegisteredCommand, context: PageContext): string | undefined {
  if (command.resolveHrefFromContext) {
    const dynamicHref = command.resolveHrefFromContext(context);
    if (dynamicHref) return dynamicHref;
  }
  if (command.href) return command.href;
  const contextual = resolveContextualHref(command.id, context);
  return contextual ?? undefined;
}

export function getAvailableCommands(context: PageContext): ResolvedCommand[] {
  const commands = filterCommandsForContext(getRegisteredCommands(), context)
    .filter((command) => canAccessCommand(command.permissions, context))
    .map((command) => ({
      ...command,
      resolvedHref: resolveHref(command, context),
    }))
    .filter((command) => canExecuteResolvedCommand(command, context));

  const seen = new Set<string>();
  const deduped: ResolvedCommand[] = [];
  for (const command of commands) {
    if (seen.has(command.id)) continue;
    seen.add(command.id);
    deduped.push(command);
  }

  return deduped.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
}

export function searchCommands(
  query: string,
  context: PageContext,
): ResolvedCommand[] {
  const available = getAvailableCommands(context);
  if (!query.trim()) return available;
  return rankByFuzzy(query, available, (command) => [
    command.title,
    command.subtitle ?? "",
    ...(command.keywords ?? []),
    command.category,
  ]);
}

export function getContextualCommands(context: PageContext): ResolvedCommand[] {
  return getAvailableCommands(context).filter(
    (command) => command.category === "contextual" && (command.priority ?? 0) > 0,
  );
}

const STAFF_SUGGESTED_IDS = [
  "communications:quick-invite",
  "organizations:browse",
  "nav:/dashboard",
] as const;

export function getSuggestedCommands(context: PageContext): ResolvedCommand[] {
  const contextual = getContextualCommands(context);
  if (contextual.length > 0) return contextual.slice(0, 6);

  const available = getAvailableCommands(context);
  const availableIds = new Set(available.map((command) => command.id));

  if (isCustomerMode(context.role)) {
    const clientSuggestedOrder = [
      "client:resume-assessment",
      "client:review-report",
      "client:view-recommendations",
      "nav:customer:assessment-dashboard",
    ];
    return clientSuggestedOrder
      .filter((id) => availableIds.has(id))
      .map((id) => available.find((command) => command.id === id)!)
      .filter(Boolean)
      .slice(0, 5);
  }

  return STAFF_SUGGESTED_IDS.filter((id) => availableIds.has(id))
    .map((id) => available.find((command) => command.id === id)!)
    .filter(Boolean)
    .slice(0, 5);
}

export function authorizeStoredNavigationItem(
  item: { href?: string; commandId?: string },
  context: PageContext,
): boolean {
  if (item.commandId) {
    const command = getCommandById(item.commandId);
    if (!command) return false;
    const resolvedHref = resolveHref(command, context);
    return canExecuteResolvedCommand({ ...command, resolvedHref }, context);
  }

  if (item.href) {
    return canAccessHref(item.href, context);
  }

  return false;
}
