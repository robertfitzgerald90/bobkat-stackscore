"use client";

import { createContext, useContext } from "react";

export type DashboardChromeContextValue = {
  user: {
    name: string;
    email: string;
    role: string;
  };
  pageTitle: string;
  sidebarCollapsed: boolean;
  onMenuClick: () => void;
  onSidebarToggle: () => void;
};

const DashboardChromeContext = createContext<DashboardChromeContextValue | null>(null);

export function DashboardChromeProvider({
  value,
  children,
}: {
  value: DashboardChromeContextValue;
  children: React.ReactNode;
}) {
  return (
    <DashboardChromeContext.Provider value={value}>{children}</DashboardChromeContext.Provider>
  );
}

export function useDashboardChrome(): DashboardChromeContextValue {
  const value = useContext(DashboardChromeContext);
  if (!value) {
    throw new Error("useDashboardChrome must be used within DashboardChromeProvider");
  }
  return value;
}
