/** Normalize text for duplicate detection across TIP report content. */
export function normalizeTipText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeTipText(value: string): Set<string> {
  const normalized = normalizeTipText(value);
  if (!normalized) return new Set();
  return new Set(normalized.split(" ").filter((token) => token.length > 2));
}

export function areTipTextsIdentical(left: string, right: string): boolean {
  const a = normalizeTipText(left);
  const b = normalizeTipText(right);
  return a.length > 0 && a === b;
}

/** Jaccard similarity over word tokens (0–1). */
export function tipTextWordOverlap(left: string, right: string): number {
  const leftTokens = tokenizeTipText(left);
  const rightTokens = tokenizeTipText(right);
  if (leftTokens.size === 0 || rightTokens.size === 0) return 0;

  let intersection = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) intersection += 1;
  }

  const union = leftTokens.size + rightTokens.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function isHighTipTextOverlap(
  left: string,
  right: string,
  threshold = 0.85,
): boolean {
  return tipTextWordOverlap(left, right) >= threshold;
}

export function dedupeTipStrings(items: string[]): string[] {
  const seen = new Set<string>();
  const results: string[] = [];

  for (const item of items) {
    const key = normalizeTipText(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    results.push(item.trim());
  }

  return results;
}

export function filterDistinctFromReference(
  candidates: string[],
  referenceItems: string[],
): string[] {
  const referenceKeys = new Set(referenceItems.map(normalizeTipText));
  return candidates.filter((candidate) => {
    const key = normalizeTipText(candidate);
    if (!key || referenceKeys.has(key)) return false;
    return !referenceItems.some((ref) => isHighTipTextOverlap(ref, candidate));
  });
}
