const MAX_ENTRIES = 32;

type Entry = {
  value: unknown;
  expiresAt: number;
  refreshedAt: string;
};

const store = new Map<string, Entry>();

export async function withProviderCache<T>(
  key: string,
  ttlMs: number,
  load: () => Promise<T>,
): Promise<{ value: T; refreshedAt: string }> {
  const hit = store.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    return { value: hit.value as T, refreshedAt: hit.refreshedAt };
  }

  const value = await load();
  const refreshedAt = new Date().toISOString();
  if (store.size >= MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest) store.delete(oldest);
  }
  store.set(key, { value, expiresAt: Date.now() + ttlMs, refreshedAt });
  return { value, refreshedAt };
}

export const PROVIDER_CACHE_TTL_MS = 10 * 60 * 1000;
