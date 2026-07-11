"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { QuickInviteModal } from "@/components/communications/quick-invite-modal";

export type QuickInvitePrefill = {
  firstName?: string;
  lastName?: string;
  company?: string;
  email?: string;
  phone?: string;
  industry?: string;
  employeeCount?: string;
  notes?: string;
  campaignId?: string;
  clientId?: string;
};

type QuickInviteContextValue = {
  openQuickInvite: (prefill?: QuickInvitePrefill) => void;
  closeQuickInvite: () => void;
  isOpen: boolean;
};

const QuickInviteContext = createContext<QuickInviteContextValue | null>(null);

export function QuickInviteProvider({
  children,
  enabled = true,
}: {
  children: React.ReactNode;
  enabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [prefill, setPrefill] = useState<QuickInvitePrefill | undefined>();

  const openQuickInvite = useCallback((next?: QuickInvitePrefill) => {
    setPrefill(next);
    setIsOpen(true);
  }, []);

  const closeQuickInvite = useCallback(() => {
    setIsOpen(false);
    setPrefill(undefined);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "i") {
        event.preventDefault();
        openQuickInvite();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, openQuickInvite]);

  const value = useMemo(
    () => ({ openQuickInvite, closeQuickInvite, isOpen }),
    [openQuickInvite, closeQuickInvite, isOpen],
  );

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <QuickInviteContext.Provider value={value}>
      {children}
      <QuickInviteModal open={isOpen} onOpenChange={setIsOpen} prefill={prefill} />
    </QuickInviteContext.Provider>
  );
}

export function useQuickInvite() {
  const context = useContext(QuickInviteContext);
  if (!context) {
    throw new Error("useQuickInvite must be used within QuickInviteProvider");
  }
  return context;
}

export function useQuickInviteOptional() {
  return useContext(QuickInviteContext);
}
