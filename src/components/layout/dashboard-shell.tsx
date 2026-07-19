"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar, MobileSidebar } from "@/components/layout/app-sidebar";
import { DashboardChromeProvider } from "@/components/layout/dashboard-chrome-context";
import { FloatingQuickInviteButton } from "@/components/communications/floating-quick-invite-button";
import { QuickInviteProvider } from "@/components/communications/quick-invite-provider";
import { CommandPaletteProvider } from "@/components/command-palette/command-palette-provider";
import { useSidebarCollapsed } from "@/hooks/use-sidebar-collapsed";
import { getPageTitle } from "@/lib/navigation/page-titles";
import { isStaffClientWorkspaceRoute } from "@/lib/navigation/client-workspace-route";
import type { ClientPortalState } from "@/lib/command-center/types";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    clientId?: string | null;
    clientPortal?: ClientPortalState | null;
  };
  children: React.ReactNode;
};

export function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { collapsed, toggleCollapsed, hydrated } = useSidebarCollapsed();
  const pageTitle = getPageTitle(pathname);
  const staffQuickInviteEnabled = user.role === "admin" || user.role === "technician";
  const usesUnifiedClientChrome = isStaffClientWorkspaceRoute(pathname, user.role);

  const shell = (
    <DashboardChromeProvider
      value={{
        user,
        pageTitle,
        sidebarCollapsed: hydrated && collapsed,
        onMenuClick: () => setMobileNavOpen(true),
        onSidebarToggle: toggleCollapsed,
      }}
    >
      <div className="flex h-screen min-h-screen overflow-hidden bg-background">
        <AppSidebar role={user.role} clientId={user.clientId} collapsed={hydrated && collapsed} />
        <MobileSidebar
          role={user.role}
          clientId={user.clientId}
          open={mobileNavOpen}
          onOpenChange={setMobileNavOpen}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {!usesUnifiedClientChrome ? (
            <AppHeader
              user={user}
              pageTitle={pageTitle}
              onMenuClick={() => setMobileNavOpen(true)}
              sidebarCollapsed={hydrated && collapsed}
              onSidebarToggle={toggleCollapsed}
            />
          ) : null}
          <main
            className={cn(
              "page-content min-w-0 flex-1 overflow-y-auto overflow-x-clip",
              usesUnifiedClientChrome
                ? "bg-muted/30 dark:bg-surface-elevated/20"
                : user.role === "client"
                  ? "bg-muted/10 p-4 sm:p-6 lg:p-8"
                  : "bg-muted/30 p-4 dark:bg-surface-elevated/20 sm:p-6 lg:p-8",
            )}
          >
            {children}
          </main>
        </div>
        {staffQuickInviteEnabled ? <FloatingQuickInviteButton /> : null}
      </div>
    </DashboardChromeProvider>
  );

  return (
    <CommandPaletteProvider user={user}>
      <QuickInviteProvider enabled={staffQuickInviteEnabled}>{shell}</QuickInviteProvider>
    </CommandPaletteProvider>
  );
}
