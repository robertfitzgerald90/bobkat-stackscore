"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "cmdk";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Star } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  resolveCommandIcon,
  SEARCH_TYPE_ICONS,
} from "@/components/command-palette/command-icons";
import { useQuickInviteOptional } from "@/components/communications/quick-invite-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { buildPageContext } from "@/lib/command-center/context";
import { initializeCommandModules } from "@/lib/command-center/modules";
import {
  getContextualCommands,
  getSuggestedCommands,
  searchCommands,
  type ResolvedCommand,
} from "@/lib/command-center/resolve-commands";
import { canExecuteResolvedCommand } from "@/lib/command-center/permissions";
import {
  getAuthorizedFavoriteItems,
  getAuthorizedRecentItems,
  getFavoriteItems,
  getRecentItems,
  pruneUnauthorizedStoredItems,
  recordRecentItem,
  toggleFavorite,
} from "@/lib/command-center/storage";
import {
  CATEGORY_LABELS,
  type ClientPortalState,
  type CommandCategory,
  type UniversalSearchResult,
} from "@/lib/command-center/types";
import { isCustomerMode } from "@/lib/navigation/portal-mode";

type CommandPaletteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    role: string;
    clientId?: string | null;
    clientPortal?: ClientPortalState | null;
  };
};

type CategoryFilter = "all" | CommandCategory;

const STAFF_CATEGORY_FILTERS: Array<{ id: CategoryFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "navigation", label: "Navigate" },
  { id: "create", label: "Create" },
  { id: "communications", label: "Communications" },
  { id: "customers", label: "Clients" },
];

const CLIENT_CATEGORY_FILTERS: Array<{ id: CategoryFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "navigation", label: "Navigate" },
  { id: "assessment", label: "Assessment" },
  { id: "deliverables", label: "Deliverables" },
  { id: "account", label: "Account" },
];

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

function matchesCategoryFilter(category: CommandCategory, filter: CategoryFilter): boolean {
  if (filter === "all") return true;
  return category === filter;
}

export function CommandPaletteDialog({ open, onOpenChange, user }: CommandPaletteDialogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const quickInvite = useQuickInviteOptional();
  const { setTheme, resolvedTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [searchResults, setSearchResults] = useState<UniversalSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [recentItems, setRecentItems] = useState(getRecentItems());
  const [favoriteItems, setFavoriteItems] = useState(getFavoriteItems());
  const debouncedQuery = useDebouncedValue(query, 200);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const pageContext = useMemo(
    () =>
      buildPageContext({
        pathname,
        role: user.role,
        userId: user.id,
        userClientId: user.clientId,
        clientPortal: user.clientPortal,
      }),
    [pathname, user.role, user.id, user.clientId, user.clientPortal],
  );

  const categoryFilters = isCustomerMode(user.role)
    ? CLIENT_CATEGORY_FILTERS
    : STAFF_CATEGORY_FILTERS;

  useEffect(() => {
    initializeCommandModules();
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setCategoryFilter("all");
      setSearchResults([]);
      return;
    }

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setRecentItems(getAuthorizedRecentItems(pageContext, user.id));
    setFavoriteItems(getAuthorizedFavoriteItems(pageContext, user.id));
    pruneUnauthorizedStoredItems(pageContext, user.id);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
      document.querySelector<HTMLInputElement>("[cmdk-input]")?.focus();
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [open, pageContext, user.id]);

  const resolveCommandForExecution = useCallback(
    (input: {
      id: string;
      title: string;
      subtitle?: string;
      href?: string;
      actionId?: string;
      type?: string;
    }): ResolvedCommand | null => {
      const available = searchCommands("", pageContext);
      const matched =
        available.find((command) => command.id === input.id) ??
        available.find(
          (command) =>
            Boolean(input.href) &&
            command.resolvedHref === input.href &&
            command.title === input.title,
        );

      if (matched) return matched;

      if (input.href && canExecuteResolvedCommand({ id: input.id, resolvedHref: input.href }, pageContext)) {
        return {
          id: input.id,
          module: "stored",
          category: "navigation",
          title: input.title,
          subtitle: input.subtitle,
          resolvedHref: input.href,
          actionId: input.actionId as ResolvedCommand["actionId"],
        };
      }

      return null;
    },
    [pageContext],
  );

  const executeCommand = useCallback(
    (input: {
      id: string;
      title: string;
      subtitle?: string;
      href?: string;
      actionId?: string;
      type?: string;
    }) => {
      const command = resolveCommandForExecution(input);
      if (!command) {
        toast.error("You do not have access to that command.");
        return;
      }

      if (!canExecuteResolvedCommand(command, pageContext)) {
        toast.error("You do not have access to that command.");
        return;
      }

      const href = command.resolvedHref ?? input.href;

      if (href) {
        recordRecentItem(
          {
            id: command.id,
            type: (input.type as never) ?? "navigation",
            title: command.title,
            subtitle: command.subtitle,
            href,
            commandId: command.id,
          },
          user.id,
        );
        onOpenChange(false);
        router.push(href);
        return;
      }

      if (command.actionId === "communications:quick-invite") {
        onOpenChange(false);
        quickInvite?.openQuickInvite();
        return;
      }

      if (command.actionId === "theme:toggle") {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
        onOpenChange(false);
        return;
      }

      if (command.actionId === "auth:sign-out") {
        onOpenChange(false);
        signOut({ callbackUrl: "/login" });
        return;
      }

      toast.error("That command is not available.");
    },
    [
      onOpenChange,
      pageContext,
      quickInvite,
      resolveCommandForExecution,
      resolvedTheme,
      router,
      setTheme,
      user.id,
    ],
  );

  useEffect(() => {
    if (!open) return;
    const q = debouncedQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;
    setSearchLoading(true);
    fetch(`/api/v1/search?q=${encodeURIComponent(q)}&limit=8`)
      .then((res) => res.json())
      .then((payload) => {
        if (!cancelled) setSearchResults(payload.results ?? []);
      })
      .catch(() => {
        if (!cancelled) setSearchResults([]);
      })
      .finally(() => {
        if (!cancelled) setSearchLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, open]);

  const filteredCommands = useMemo(() => {
    const commands = searchCommands(query, pageContext);
    if (categoryFilter === "all") return commands;
    return commands.filter((command) => matchesCategoryFilter(command.category, categoryFilter));
  }, [query, pageContext, categoryFilter]);

  const contextualCommands = useMemo(() => {
    const commands = getContextualCommands(pageContext);
    if (categoryFilter === "all") return commands;
    return commands.filter((command) => matchesCategoryFilter(command.category, categoryFilter));
  }, [pageContext, categoryFilter]);

  const suggestedCommands = useMemo(() => {
    const commands = getSuggestedCommands(pageContext);
    if (categoryFilter === "all") return commands;
    return commands.filter((command) => matchesCategoryFilter(command.category, categoryFilter));
  }, [pageContext, categoryFilter]);

  const dedupedSuggestedCommands = useMemo(() => {
    const navigationIds = new Set(
      filteredCommands.filter((command) => command.category === "navigation").map((command) => command.id),
    );
    return suggestedCommands.filter((command) => !navigationIds.has(command.id));
  }, [filteredCommands, suggestedCommands]);

  const visibleCategoryFilters = useMemo(() => {
    if (!isCustomerMode(user.role)) return categoryFilters;
    const availableCategories = new Set(
      searchCommands("", pageContext).map((command) => command.category),
    );
    return categoryFilters.filter(
      (filter) => filter.id === "all" || availableCategories.has(filter.id),
    );
  }, [categoryFilters, pageContext, user.role]);

  const groupedCommands = useMemo(() => {
    const groups = new Map<string, ResolvedCommand[]>();
    for (const command of filteredCommands) {
      if (command.category === "contextual" && !query.trim()) continue;
      const list = groups.get(command.category) ?? [];
      list.push(command);
      groups.set(command.category, list);
    }
    return groups;
  }, [filteredCommands, query]);

  const showEmptyState = !query.trim();
  const showRecentAndFavorites = showEmptyState && categoryFilter === "all";
  const isMac =
    typeof navigator !== "undefined" && navigator.platform.toLowerCase().includes("mac");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="command-palette flex max-h-[min(calc(100dvh-2rem),720px)] flex-col gap-0 p-0"
        aria-describedby="command-palette-description"
      >
        <Command shouldFilter={false} className="flex h-full min-h-0 flex-1 flex-col bg-[#0b1526]">
          <DialogHeader className="shrink-0 space-y-3">
            <div>
              <DialogTitle>Command Palette</DialogTitle>
              <DialogDescription id="command-palette-description">
                Search commands, pages, clients, assessments, and more.
              </DialogDescription>
            </div>
            <div className="space-y-2">
              <label htmlFor="command-palette-search" className="sr-only">
                Search commands
              </label>
              <CommandInput
                ref={inputRef}
                id="command-palette-search"
                value={query}
                onValueChange={setQuery}
                placeholder="Search commands, pages, clients, assessments..."
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-base text-white outline-none placeholder:text-white/45 focus:border-white/20 focus:ring-2 focus:ring-[#7D97AC]/40"
              />
            </div>
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Command categories">
              {visibleCategoryFilters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  role="tab"
                  aria-selected={categoryFilter === filter.id}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    categoryFilter === filter.id
                      ? "bg-white/12 text-white"
                      : "text-white/55 hover:bg-white/6 hover:text-white/80",
                  )}
                  onClick={() => setCategoryFilter(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </DialogHeader>

          <CommandList className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
            <CommandEmpty className="px-3 py-8 text-center text-sm text-white/50">
              {searchLoading ? "Searching..." : "No matching commands or records."}
            </CommandEmpty>

            {showRecentAndFavorites && favoriteItems.length > 0 ? (
              <CommandGroup heading="Favorites" className="cmd-group">
                {favoriteItems.map((item) => (
                  <PaletteItem
                    key={item.id}
                    value={`favorite-${item.id}`}
                    icon={Star}
                    title={item.title}
                    subtitle={item.subtitle}
                    onSelect={() =>
                      executeCommand({
                        id: item.commandId ?? item.id,
                        title: item.title,
                        subtitle: item.subtitle,
                        href: item.href,
                        type: item.type,
                      })
                    }
                  />
                ))}
              </CommandGroup>
            ) : null}

            {showEmptyState && contextualCommands.length > 0 ? (
              <CommandGroup heading={CATEGORY_LABELS.contextual} className="cmd-group">
                {contextualCommands.map((command) => (
                  <CommandRow
                    key={command.id}
                    command={command}
                    onSelect={() =>
                      executeCommand({
                        id: command.id,
                        title: command.title,
                        subtitle: command.subtitle,
                        href: command.resolvedHref,
                        actionId: command.actionId,
                      })
                    }
                  />
                ))}
              </CommandGroup>
            ) : null}

            {showEmptyState && dedupedSuggestedCommands.length > 0 ? (
              <CommandGroup heading={CATEGORY_LABELS.suggested} className="cmd-group">
                {dedupedSuggestedCommands.map((command) => (
                  <CommandRow
                    key={command.id}
                    command={command}
                    onSelect={() =>
                      executeCommand({
                        id: command.id,
                        title: command.title,
                        subtitle: command.subtitle,
                        href: command.resolvedHref,
                        actionId: command.actionId,
                      })
                    }
                  />
                ))}
              </CommandGroup>
            ) : null}

            {showRecentAndFavorites && recentItems.length > 0 ? (
              <CommandGroup heading="Recent" className="cmd-group">
                {recentItems.slice(0, 8).map((item) => (
                  <PaletteItem
                    key={item.id}
                    value={`recent-${item.id}`}
                    icon={resolveCommandIcon("ArrowRight")}
                    title={item.title}
                    subtitle={item.subtitle}
                    onSelect={() =>
                      executeCommand({
                        id: item.commandId ?? item.id,
                        title: item.title,
                        subtitle: item.subtitle,
                        href: item.href,
                        type: item.type,
                      })
                    }
                  />
                ))}
              </CommandGroup>
            ) : null}

            {searchResults.length > 0 ? (
              <CommandGroup heading="Search Results" className="cmd-group">
                {searchResults.map((result) => {
                  const Icon = SEARCH_TYPE_ICONS[result.type] ?? resolveCommandIcon("Search");
                  return (
                    <PaletteItem
                      key={result.id}
                      value={result.id}
                      icon={Icon}
                      title={result.title}
                      subtitle={result.subtitle}
                      onSelect={() =>
                        executeCommand({
                          id: result.id,
                          title: result.title,
                          subtitle: result.subtitle,
                          href: result.href,
                          type: result.type,
                        })
                      }
                    />
                  );
                })}
              </CommandGroup>
            ) : null}

            {[...groupedCommands.entries()].map(([category, commands]) => {
              if (showEmptyState && (category === "contextual" || category === "suggested")) {
                return null;
              }
              if (commands.length === 0) return null;
              return (
                <CommandGroup
                  key={category}
                  heading={CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] ?? category}
                  className="cmd-group"
                >
                  {commands.map((command) => (
                    <CommandRow
                      key={command.id}
                      command={command}
                      onSelect={() =>
                        executeCommand({
                          id: command.id,
                          title: command.title,
                          subtitle: command.subtitle,
                          href: command.resolvedHref,
                          actionId: command.actionId,
                        })
                      }
                      onToggleFavorite={() => {
                        toggleFavorite(
                          {
                            id: command.favoriteKey ?? command.id,
                            type: "command",
                            title: command.title,
                            subtitle: command.subtitle,
                            href: command.resolvedHref,
                            commandId: command.id,
                          },
                          user.id,
                        );
                        setFavoriteItems(getAuthorizedFavoriteItems(pageContext, user.id));
                      }}
                    />
                  ))}
                </CommandGroup>
              );
            })}
          </CommandList>

          <DialogFooter className="shrink-0 text-[11px] text-white/40">
            <span>↑ ↓ Navigate · Enter Select · Esc Close</span>
            <span>{isMac ? "⌘K" : "Ctrl+K"}</span>
          </DialogFooter>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function CommandRow({
  command,
  onSelect,
  onToggleFavorite,
}: {
  command: ResolvedCommand;
  onSelect: () => void;
  onToggleFavorite?: () => void;
}) {
  const Icon = resolveCommandIcon(command.icon);
  return (
    <PaletteItem
      value={command.id}
      icon={Icon}
      title={command.title}
      subtitle={command.subtitle}
      shortcut={command.shortcut}
      onSelect={onSelect}
      onToggleFavorite={onToggleFavorite}
    />
  );
}

function PaletteItem({
  value,
  icon: Icon,
  title,
  subtitle,
  shortcut,
  onSelect,
  onToggleFavorite,
}: {
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  shortcut?: string;
  onSelect: () => void;
  onToggleFavorite?: () => void;
}) {
  return (
    <CommandItem
      value={value}
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm outline-none aria-selected:bg-white/10"
    >
      <Icon className="size-4 shrink-0 text-[#7D97AC]" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-white">{title}</p>
        {subtitle ? <p className="truncate text-xs text-white/45">{subtitle}</p> : null}
      </div>
      {shortcut ? (
        <span className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-white/45">
          {shortcut}
        </span>
      ) : null}
      {onToggleFavorite ? (
        <button
          type="button"
          className="rounded p-1 text-white/35 hover:text-amber-300"
          aria-label="Pin favorite"
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite();
          }}
        >
          <Star className="size-3.5" />
        </button>
      ) : null}
    </CommandItem>
  );
}
