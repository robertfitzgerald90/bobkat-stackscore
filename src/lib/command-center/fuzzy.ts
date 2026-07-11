/**
 * Lightweight fuzzy scoring for command palette search.
 * Returns 0 when no match; higher is better.
 */
export function fuzzyScore(query: string, target: string): number {
  const q = query.trim().toLowerCase();
  const t = target.trim().toLowerCase();
  if (!q) return 1;
  if (!t) return 0;
  if (t === q) return 100;
  if (t.startsWith(q)) return 80;
  if (t.includes(q)) return 60;

  let score = 0;
  let tIndex = 0;
  for (const char of q) {
    const found = t.indexOf(char, tIndex);
    if (found === -1) return 0;
    score += 10 - Math.min(9, found - tIndex);
    tIndex = found + 1;
  }
  return score;
}

export function scoreCommandMatch(
  query: string,
  parts: Array<string | undefined>,
): number {
  if (!query.trim()) return 1;
  return Math.max(...parts.filter(Boolean).map((part) => fuzzyScore(query, part!)), 0);
}

export function rankByFuzzy<T>(
  query: string,
  items: T[],
  getSearchable: (item: T) => string[],
): T[] {
  if (!query.trim()) return items;
  return [...items]
    .map((item) => ({
      item,
      score: scoreCommandMatch(query, getSearchable(item)),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item);
}
