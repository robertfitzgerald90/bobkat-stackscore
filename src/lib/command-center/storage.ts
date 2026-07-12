import {
  authorizeStoredNavigationItem,
} from "@/lib/command-center/resolve-commands";
import type { FavoriteItem, PageContext, RecentItem } from "@/lib/command-center/types";

const RECENT_PREFIX = "stackscore-command-recent";
const FAVORITES_PREFIX = "stackscore-command-favorites";
const LEGACY_RECENT_KEY = "stackscore-command-recent";
const LEGACY_FAVORITES_KEY = "stackscore-command-favorites";
const MAX_RECENT = 12;
const MAX_FAVORITES = 20;

function scopedKey(prefix: string, userId?: string | null): string {
  return userId ? `${prefix}:${userId}` : prefix;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function purgeLegacyStorage(userId?: string | null): void {
  if (typeof window === "undefined" || !userId) return;
  window.localStorage.removeItem(LEGACY_RECENT_KEY);
  window.localStorage.removeItem(LEGACY_FAVORITES_KEY);
}

export function getRecentItems(userId?: string | null): RecentItem[] {
  purgeLegacyStorage(userId);
  return readJson<RecentItem[]>(scopedKey(RECENT_PREFIX, userId), []);
}

export function getAuthorizedRecentItems(
  context: PageContext,
  userId?: string | null,
): RecentItem[] {
  return getRecentItems(userId).filter((item) =>
    authorizeStoredNavigationItem(
      { href: item.href, commandId: item.commandId },
      context,
    ),
  );
}

export function recordRecentItem(
  item: Omit<RecentItem, "visitedAt">,
  userId?: string | null,
): RecentItem[] {
  const next: RecentItem = { ...item, visitedAt: new Date().toISOString() };
  const existing = getRecentItems(userId).filter((entry) => entry.id !== item.id);
  const merged = [next, ...existing].slice(0, MAX_RECENT);
  writeJson(scopedKey(RECENT_PREFIX, userId), merged);
  return merged;
}

export function getFavoriteItems(userId?: string | null): FavoriteItem[] {
  purgeLegacyStorage(userId);
  return readJson<FavoriteItem[]>(scopedKey(FAVORITES_PREFIX, userId), []);
}

export function getAuthorizedFavoriteItems(
  context: PageContext,
  userId?: string | null,
): FavoriteItem[] {
  return getFavoriteItems(userId).filter((item) =>
    authorizeStoredNavigationItem(
      { href: item.href, commandId: item.commandId },
      context,
    ),
  );
}

export function isFavorite(id: string, userId?: string | null): boolean {
  return getFavoriteItems(userId).some((item) => item.id === id);
}

export function toggleFavorite(
  item: Omit<FavoriteItem, "pinnedAt">,
  userId?: string | null,
): FavoriteItem[] {
  const existing = getFavoriteItems(userId);
  const index = existing.findIndex((entry) => entry.id === item.id);
  if (index >= 0) {
    const next = existing.filter((entry) => entry.id !== item.id);
    writeJson(scopedKey(FAVORITES_PREFIX, userId), next);
    return next;
  }

  const next = [{ ...item, pinnedAt: new Date().toISOString() }, ...existing].slice(
    0,
    MAX_FAVORITES,
  );
  writeJson(scopedKey(FAVORITES_PREFIX, userId), next);
  return next;
}

export function removeFavorite(id: string, userId?: string | null): FavoriteItem[] {
  const next = getFavoriteItems(userId).filter((item) => item.id !== id);
  writeJson(scopedKey(FAVORITES_PREFIX, userId), next);
  return next;
}

export function pruneUnauthorizedStoredItems(
  context: PageContext,
  userId?: string | null,
): void {
  const recent = getAuthorizedRecentItems(context, userId);
  const favorites = getAuthorizedFavoriteItems(context, userId);
  writeJson(scopedKey(RECENT_PREFIX, userId), recent);
  writeJson(scopedKey(FAVORITES_PREFIX, userId), favorites);
}
