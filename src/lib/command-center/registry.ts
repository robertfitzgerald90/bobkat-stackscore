import type {
  CommandDefinition,
  PageContext,
  RegisteredCommand,
} from "@/lib/command-center/types";

const registry: RegisteredCommand[] = [];
const registryById = new Map<string, RegisteredCommand>();

export function registerCommand(
  module: string,
  command: CommandDefinition,
): RegisteredCommand {
  const existing = registryById.get(command.id);
  if (existing) {
    return existing;
  }

  const entry: RegisteredCommand = { ...command, module };
  registry.push(entry);
  registryById.set(command.id, entry);
  return entry;
}

export function registerCommands(module: string, commands: CommandDefinition[]): void {
  for (const command of commands) {
    registerCommand(module, command);
  }
}

export function getRegisteredCommands(): RegisteredCommand[] {
  return [...registry];
}

export function getCommandById(id: string): RegisteredCommand | undefined {
  return registryById.get(id);
}

export function clearCommandRegistry(): void {
  registry.length = 0;
  registryById.clear();
}

export function filterCommandsForContext(
  commands: RegisteredCommand[],
  context: PageContext,
): RegisteredCommand[] {
  return commands.filter((command) => {
    if (command.when && !command.when(context)) {
      return false;
    }
    return true;
  });
}
