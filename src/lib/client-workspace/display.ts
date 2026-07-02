import type { ImmediateFocusItem } from "@/lib/client-workspace/immediate-focus";

/** Strips assessment-question suffixes from recommendation titles for compact workspace rows. */
export function conciseFocusTitle(title: string): string {
  const colonIndex = title.indexOf(":");
  if (colonIndex <= 0) return title.trim();

  const head = title.slice(0, colonIndex).trim();
  const tail = title.slice(colonIndex + 1).trim();
  if (!head) return title.trim();

  if (tail.includes("?") || /^(Are|Is|Do|Does|Can|Have|Has|Was|Were)\b/i.test(tail)) {
    return head;
  }

  return title.trim();
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
