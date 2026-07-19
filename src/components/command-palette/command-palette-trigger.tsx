"use client";

import { Search } from "lucide-react";
import { useCommandPaletteOptional } from "@/components/command-palette/command-palette-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CommandPaletteTrigger({ className }: { className?: string }) {
  const palette = useCommandPaletteOptional();
  if (!palette) return null;

  const isMac =
    typeof navigator !== "undefined" && navigator.platform.toLowerCase().includes("mac");

  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "hidden h-9 w-[min(280px,34vw)] justify-between gap-2 px-3 md:inline-flex",
        "border-border/80 bg-background text-muted-foreground",
        className,
      )}
      onClick={palette.openCommandPalette}
      aria-label="Open command palette"
    >
      <span className="flex items-center gap-2 truncate text-sm">
        <Search className="size-4 shrink-0" />
        Search StackScore...
      </span>
      <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] font-medium lg:inline">
        {isMac ? "⌘K" : "Ctrl+K"}
      </kbd>
    </Button>
  );
}
