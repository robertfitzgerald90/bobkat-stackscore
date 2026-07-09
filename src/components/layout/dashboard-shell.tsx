"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar, MobileSidebar } from "@/components/layout/app-sidebar";
import { getPageTitle } from "@/lib/navigation/page-titles";

type DashboardShellProps = {
  user: { name: string; email: string; role: string; clientId?: string | null };
  children: React.ReactNode;
};

export function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pageTitle = getPageTitle(pathname);

  return (
    <div className="flex h-screen min-h-screen overflow-hidden bg-background">
      <AppSidebar role={user.role} clientId={user.clientId} />
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
        />
        <main className="page-content flex-1 overflow-y-auto overflow-x-hidden bg-muted/40 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
