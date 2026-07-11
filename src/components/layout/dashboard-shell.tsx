"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar, MobileSidebar } from "@/components/layout/app-sidebar";
import { FloatingQuickInviteButton } from "@/components/communications/floating-quick-invite-button";
import { QuickInviteProvider } from "@/components/communications/quick-invite-provider";
import { useSidebarCollapsed } from "@/hooks/use-sidebar-collapsed";
import { getPageTitle } from "@/lib/navigation/page-titles";

type DashboardShellProps = {
  user: { name: string; email: string; role: string; clientId?: string | null };
  children: React.ReactNode;
};

export function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { collapsed, toggleCollapsed, hydrated } = useSidebarCollapsed();
  const pageTitle = getPageTitle(pathname);
  const staffQuickInviteEnabled = user.role === "admin" || user.role === "technician";

  const shell = (
    <div className="flex h-screen min-h-screen overflow-hidden bg-background">
      <AppSidebar role={user.role} clientId={user.clientId} collapsed={hydrated && collapsed} />
      <MobileSidebar
        role={user.role}
        clientId={user.clientId}
        open={mobileNavOpen}
        onOpenChange={setMobileNavOpen}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <AppHeader
          user={user}
          pageTitle={pageTitle}
          onMenuClick={() => setMobileNavOpen(true)}
          sidebarCollapsed={hydrated && collapsed}
          onSidebarToggle={toggleCollapsed}
        />
        <main className="page-content flex-1 overflow-y-auto overflow-x-hidden bg-muted/30 p-4 dark:bg-surface-elevated/20 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
      {staffQuickInviteEnabled ? <FloatingQuickInviteButton /> : null}
    </div>
  );

  if (!staffQuickInviteEnabled) {
    return shell;
  }

  return <QuickInviteProvider enabled={staffQuickInviteEnabled}>{shell}</QuickInviteProvider>;
}
