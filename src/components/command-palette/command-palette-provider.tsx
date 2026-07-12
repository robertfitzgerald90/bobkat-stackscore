"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CommandPaletteDialog } from "@/components/command-palette/command-palette-dialog";
import {
  isCommandPaletteInput,
  isTypingTarget,
} from "@/lib/keyboard-shortcuts";

type CommandPaletteContextValue = {
  open: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;
};

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

import type { ClientPortalState } from "@/lib/command-center/types";

export function CommandPaletteProvider({
  children,
  user,
}: {
  children: React.ReactNode;
  user: {
    id: string;
    role: string;
    clientId?: string | null;
    clientPortal?: ClientPortalState | null;
  };
}) {
  const [open, setOpen] = useState(false);

  const openCommandPalette = useCallback(() => setOpen(true), []);
  const closeCommandPalette = useCallback(() => setOpen(false), []);
  const toggleCommandPalette = useCallback(() => setOpen((current) => !current), []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const modifier = isMac ? event.metaKey : event.ctrlKey;
      if (!modifier || event.key.toLowerCase() !== "k") return;

      if (isTypingTarget(event.target) && !isCommandPaletteInput(event.target)) {
        return;
      }

      event.preventDefault();
      setOpen((current) => !current);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const value = useMemo(
    () => ({
      open,
      openCommandPalette,
      closeCommandPalette,
      toggleCommandPalette,
    }),
    [open, openCommandPalette, closeCommandPalette, toggleCommandPalette],
  );

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <CommandPaletteDialog open={open} onOpenChange={setOpen} user={user} />
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error("useCommandPalette must be used within CommandPaletteProvider");
  }
  return context;
}

export function useCommandPaletteOptional() {
  return useContext(CommandPaletteContext);
}
