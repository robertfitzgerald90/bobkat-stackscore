import type { FavoriteItem, RecentItem } from "@/lib/command-center/types";

const RECENT_KEY = "stackscore-command-recent";
const FAVORITES_KEY = "stackscore-command-favorites";
const MAX_RECENT = 12;
const MAX_FAVORITES = 20;

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

export function getRecentItems(): RecentItem[] {
  return readJson<RecentItem[]>(RECENT_KEY, []);
}

export function recordRecentItem(item: Omit<RecentItem, "visitedAt">): RecentItem[] {
  const next: RecentItem = { ...item, visitedAt: new Date().toISOString() };
  const existing = getRecentItems().filter((entry) => entry.id !== item.id);
  const merged = [next, ...existing].slice(0, MAX_RECENT);
  writeJson(RECENT_KEY, merged);
  return merged;
}

export function getFavoriteItems(): FavoriteItem[] {
  return readJson<FavoriteItem[]>(FAVORITES_KEY, []);
}

export function isFavorite(id: string): boolean {
  return getFavoriteItems().some((item) => item.id === id);
}

export function toggleFavorite(item: Omit<FavoriteItem, "pinnedAt">): FavoriteItem[] {
  const existing = getFavoriteItems();
  const index = existing.findIndex((entry) => entry.id === item.id);
  if (index >= 0) {
    const next = existing.filter((entry) => entry.id !== item.id);
    writeJson(FAVORITES_KEY, next);
    return next;
  }

  const next = [{ ...item, pinnedAt: new Date().toISOString() }, ...existing].slice(
    0,
    MAX_FAVORITES,
  );
  writeJson(FAVORITES_KEY, next);
  return next;
}

export function removeFavorite(id: string): FavoriteItem[] {
  const next = getFavoriteItems().filter((item) => item.id !== id);
  writeJson(FAVORITES_KEY, next);
  return next;
}
