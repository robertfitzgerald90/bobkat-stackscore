import type { UserRole } from "@/generated/prisma/client";

export const COMMAND_CATEGORIES = [
  "navigation",
  "create",
  "communications",
  "technology",
  "projects",
  "customers",
  "search",
  "recent",
  "favorites",
  "contextual",
  "suggested",
] as const;

export type CommandCategory = (typeof COMMAND_CATEGORIES)[number];

export type CommandPermissions = {
  roles?: UserRole[];
  adminOnly?: boolean;
  staffOnly?: boolean;
  portfolioOnly?: boolean;
  requiresClient?: boolean;
  clientHidden?: boolean;
};

export type CommandActionId =
  | "communications:quick-invite"
  | "communications:test-email"
  | "communications:preview-template"
  | "theme:toggle"
  | "auth:sign-out";

export type PageContext = {
  pathname: string;
  role: string;
  userClientId: string | null;
  clientId: string | null;
  assessmentId: string | null;
  technologySlug: string | null;
  projectId: string | null;
  campaignId: string | null;
  prospectId: string | null;
  templateKey: string | null;
};

export type CommandDefinition = {
  id: string;
  category: CommandCategory;
  title: string;
  subtitle?: string;
  keywords?: string[];
  icon?: string;
  permissions?: CommandPermissions;
  href?: string;
  actionId?: CommandActionId;
  shortcut?: string;
  /** Higher priority contextual commands surface first when matched */
  priority?: number;
  /** When set, command only appears if matcher returns true */
  when?: (context: PageContext) => boolean;
  /** Marks command as eligible for AI/dynamic extension in future sprints */
  dynamic?: boolean;
  /** Pin-able favorite key */
  favoriteKey?: string;
};

export type RegisteredCommand = CommandDefinition & {
  module: string;
};

export type SearchResultType =
  | "organization"
  | "prospect"
  | "assessment"
  | "campaign"
  | "template"
  | "project"
  | "technology"
  | "playbook";

export type UniversalSearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  href: string;
  keywords?: string[];
};

export type RecentItem = {
  id: string;
  type: SearchResultType | "navigation" | "action";
  title: string;
  subtitle?: string;
  href: string;
  visitedAt: string;
};

export type FavoriteItem = {
  id: string;
  type: SearchResultType | "navigation" | "command";
  title: string;
  subtitle?: string;
  href?: string;
  commandId?: string;
  pinnedAt: string;
};

export const CATEGORY_LABELS: Record<CommandCategory, string> = {
  navigation: "Navigation",
  create: "Create",
  communications: "Communications",
  technology: "Technology",
  projects: "Projects",
  customers: "Customers",
  search: "Search Results",
  recent: "Recent",
  favorites: "Favorites",
  contextual: "Suggested for this page",
  suggested: "Suggested",
};
