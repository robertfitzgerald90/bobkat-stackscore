"use client";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "cmdk";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  resolveCommandIcon,
  SEARCH_TYPE_ICONS,
} from "@/components/command-palette/command-icons";
import { useQuickInviteOptional } from "@/components/communications/quick-invite-provider";
import { buildPageContext } from "@/lib/command-center/context";
import { initializeCommandModules } from "@/lib/command-center/modules";
import {
  getContextualCommands,
  getSuggestedCommands,
  searchCommands,
  type ResolvedCommand,
} from "@/lib/command-center/resolve-commands";
import {
  getFavoriteItems,
  getRecentItems,
  recordRecentItem,
  toggleFavorite,
} from "@/lib/command-center/storage";
import { CATEGORY_LABELS, type UniversalSearchResult } from "@/lib/command-center/types";

type CommandPaletteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: { role: string; clientId?: string | null };
};

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export function CommandPaletteDialog({ open, onOpenChange, user }: CommandPaletteDialogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const quickInvite = useQuickInviteOptional();
  const { setTheme, resolvedTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UniversalSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [recentItems, setRecentItems] = useState(getRecentItems());
  const [favoriteItems, setFavoriteItems] = useState(getFavoriteItems());
  const debouncedQuery = useDebouncedValue(query, 200);

  const pageContext = useMemo(
    () =>
      buildPageContext({
        pathname,
        role: user.role,
        userClientId: user.clientId,
      }),
    [pathname, user.role, user.clientId],
  );

  useEffect(() => {
    initializeCommandModules();
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSearchResults([]);
      return;
    }
    setRecentItems(getRecentItems());
    setFavoriteItems(getFavoriteItems());
  }, [open]);

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

  const executeCommand = useCallback(
    (input: {
      id: string;
      title: string;
      subtitle?: string;
      href?: string;
      actionId?: string;
      type?: string;
    }) => {
      if (input.href) {
        recordRecentItem({
          id: input.id,
          type: (input.type as never) ?? "navigation",
          title: input.title,
          subtitle: input.subtitle,
          href: input.href,
        });
        onOpenChange(false);
        router.push(input.href);
        return;
      }

      if (input.actionId === "communications:quick-invite") {
        onOpenChange(false);
        quickInvite?.openQuickInvite();
        return;
      }

      if (input.actionId === "theme:toggle") {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
        onOpenChange(false);
        return;
      }

      if (input.actionId === "auth:sign-out") {
        onOpenChange(false);
        signOut({ callbackUrl: "/login" });
      }
    },
    [onOpenChange, quickInvite, resolvedTheme, router, setTheme],
  );

  const filteredCommands = useMemo(
    () => searchCommands(query, pageContext),
    [query, pageContext],
  );

  const contextualCommands = useMemo(
    () => getContextualCommands(pageContext),
    [pageContext],
  );

  const suggestedCommands = useMemo(
    () => getSuggestedCommands(pageContext),
    [pageContext],
  );

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
  const isMac =
    typeof navigator !== "undefined" && navigator.platform.toLowerCase().includes("mac");

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      label="Global Command Palette"
      overlayClassName="bg-black/60 backdrop-blur-sm"
      contentClassName="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1526] p-0 text-white shadow-2xl"
    >
      <Command shouldFilter={false} className="flex max-h-[min(70vh,640px)] flex-col bg-[#0b1526]">
        <div className="border-b border-white/10 px-4 py-3">
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search StackScore or type a command..."
            className="h-10 w-full bg-transparent text-base text-white outline-none placeholder:text-white/45"
          />
          <p className="mt-2 text-xs text-white/45">
            Navigate · Create · Search · Recent · Favorites
          </p>
        </div>

        <CommandList className="max-h-[min(56vh,520px)] overflow-y-auto p-2">
          <CommandEmpty className="px-3 py-8 text-center text-sm text-white/50">
            {searchLoading ? "Searching..." : "No matching commands or records."}
          </CommandEmpty>

          {showEmptyState && favoriteItems.length > 0 ? (
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
                      id: item.id,
                      title: item.title,
                      subtitle: item.subtitle,
                      href: item.href,
                      actionId: item.commandId,
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

          {showEmptyState && suggestedCommands.length > 0 ? (
            <CommandGroup heading={CATEGORY_LABELS.suggested} className="cmd-group">
              {suggestedCommands.map((command) => (
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

          {showEmptyState && recentItems.length > 0 ? (
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
                      id: item.id,
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
                      toggleFavorite({
                        id: command.favoriteKey ?? command.id,
                        type: "command",
                        title: command.title,
                        subtitle: command.subtitle,
                        href: command.resolvedHref,
                        commandId: command.actionId,
                      });
                      setFavoriteItems(getFavoriteItems());
                    }}
                  />
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>

        <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 text-[11px] text-white/40">
          <span>↑↓ navigate · ↵ run · esc close</span>
          <span>{isMac ? "⌘K" : "Ctrl+K"}</span>
        </div>
      </Command>

      <style jsx global>{`
        .cmd-group [cmdk-group-heading] {
          padding: 0.5rem 0.75rem 0.25rem;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.38);
        }
        [cmdk-item][data-selected="true"] {
          background: rgba(255, 255, 255, 0.08);
        }
      `}</style>
    </CommandDialog>
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
