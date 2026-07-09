"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { canAccessPortfolio } from "@/lib/navigation/default-landing";
import {
  getSidebarNavForRole,
  resolveClientIdFromPathname,
} from "@/lib/navigation/sidebar-nav";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { BRAND } from "@/lib/branding";
import { cn } from "@/lib/utils";

function SidebarNav({
  role,
  clientId,
  onNavigate,
}: {
  role: string;
  clientId: string | null;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const pathClientId = resolveClientIdFromPathname(pathname);
  const effectiveClientId = pathClientId ?? clientId;
  const navItems = getSidebarNavForRole(role, effectiveClientId);

  return (
    <>
      <div className="shrink-0 border-b border-sidebar-border px-5 py-5">
        <BrandLogo
          href={canAccessPortfolio(role) ? "/portfolio" : "/dashboard"}
          size={44}
          variant="sidebar"
        />
      </div>
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              item.href !== "/clients" &&
              pathname.startsWith(`${item.href}/`)) ||
            (item.href === "/clients" && pathname.startsWith("/clients/"));
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground/85 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto shrink-0 border-t border-sidebar-border px-5 py-4">
        <p className="text-sm font-medium text-sidebar-foreground">Bobkat StackScore</p>
        <p className="mt-0.5 text-xs text-sidebar-foreground/75">v{BRAND.productVersion}</p>
        <p className="mt-1 text-xs text-sidebar-foreground/65">
          Powered by {BRAND.companyName}
        </p>
      </div>
    </>
  );
}

export function AppSidebar({
  role,
  clientId,
}: {
  role: string;
  clientId?: string | null;
}) {
  return (
    <aside className="hidden h-full min-h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
      <SidebarNav role={role} clientId={clientId ?? null} />
    </aside>
  );
}

export function MobileSidebar({
  role,
  clientId,
  open,
  onOpenChange,
}: {
  role: string;
  clientId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="flex h-full w-[min(100%,280px)] flex-col gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground sm:max-w-xs"
      >
        <div className="flex h-full min-h-0 flex-col">
          <SidebarNav
            role={role}
            clientId={clientId ?? null}
            onNavigate={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
