export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return false;
}

export function isCommandPaletteInput(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && target.hasAttribute("cmdk-input");
}
