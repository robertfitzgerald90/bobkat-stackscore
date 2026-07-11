export { registerCommand, registerCommands, getRegisteredCommands } from "@/lib/command-center/registry";
export type {
  CommandDefinition,
  CommandCategory,
  CommandPermissions,
  CommandActionId,
  PageContext,
  UniversalSearchResult,
  RecentItem,
  FavoriteItem,
} from "@/lib/command-center/types";
export { buildPageContext } from "@/lib/command-center/context";
export { universalSearch } from "@/lib/command-center/search/universal-search";
