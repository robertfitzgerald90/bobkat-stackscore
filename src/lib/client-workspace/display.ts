import type { ImmediateFocusItem } from "@/lib/client-workspace/immediate-focus";

/**
 * Prefer the specific finding/question over a pillar-style "Improve X:" prefix.
 * Catalog titles are often "Improve {Pillar}: {assessment question}" — the question
 * is what distinguishes items within the same pillar on Immediate Focus rows.
 */
export function conciseFocusTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return trimmed;

  const colonIndex = trimmed.indexOf(":");
  if (colonIndex <= 0) return trimmed;

  const head = trimmed.slice(0, colonIndex).trim();
  const tail = trimmed.slice(colonIndex + 1).trim();
  if (!tail) return trimmed;

  const isPillarPrefix = /^Improve\b/i.test(head);
  const isQuestionLike =
    tail.includes("?") ||
    /^(Are|Is|Do|Does|Can|Have|Has|Was|Were|Should|Will)\b/i.test(tail);

  if (isPillarPrefix || isQuestionLike) {
    return tail;
  }

  return trimmed;
}

/** Builds the muted metadata line for Immediate Focus rows (DOC-160 §6). */
export function formatFocusMetadataLine(item: ImmediateFocusItem): string {
  const parts: string[] = [item.pillarName];

  if (item.estimatedImpactPoints !== null) {
    parts.push(`+${item.estimatedImpactPoints} pts`);
  }

  parts.push(item.statusLabel, item.readinessLabel, item.sourceLabel);

  return parts.join(" · ");
}
