import type { PageContext, RegisteredCommand } from "@/lib/command-center/types";
import { resolveContextualHref } from "@/lib/command-center/modules/communications";
import { canAccessCommand } from "@/lib/command-center/permissions";
import {
  filterCommandsForContext,
  getRegisteredCommands,
} from "@/lib/command-center/registry";
import { rankByFuzzy } from "@/lib/command-center/fuzzy";

export type ResolvedCommand = RegisteredCommand & {
  resolvedHref?: string;
};

function resolveHref(command: RegisteredCommand, context: PageContext): string | undefined {
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
    .filter((command) => {
      if (command.actionId) return true;
      if (command.resolvedHref) return true;
      return false;
    });

  return commands.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
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

export function getSuggestedCommands(context: PageContext): ResolvedCommand[] {
  const contextual = getContextualCommands(context);
  if (contextual.length > 0) return contextual.slice(0, 6);

  return getAvailableCommands(context)
    .filter((command) =>
      ["communications:quick-invite", "assessments:dashboard", "organizations:browse"].includes(
        command.id,
      ),
    )
    .slice(0, 5);
}
