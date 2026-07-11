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

function NavTooltip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span className="group/nav-tip relative flex w-full">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs font-medium text-popover-foreground opacity-0 shadow-md transition-opacity group-hover/nav-tip:opacity-100 group-focus-within/nav-tip:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}

function SidebarNav({
  role,
  clientId,
  collapsed = false,
  onNavigate,
}: {
  role: string;
  clientId: string | null;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const pathClientId = resolveClientIdFromPathname(pathname);
  const effectiveClientId = pathClientId ?? clientId;
  const navItems = getSidebarNavForRole(role, effectiveClientId);
  const logoHref = canAccessPortfolio(role) ? "/portfolio" : "/dashboard";

  return (
    <>
      <div
        className={cn(
          "shrink-0 border-b border-sidebar-border py-5 transition-[padding] duration-300",
          collapsed ? "px-3" : "px-5",
        )}
      >
        <BrandLogo
          href={logoHref}
          size={collapsed ? 36 : 44}
          variant="sidebar"
          showText={!collapsed}
          collapsed={collapsed}
        />
      </div>
      <nav
        className={cn(
          "min-h-0 flex-1 space-y-1 overflow-y-auto transition-[padding] duration-300",
          collapsed ? "p-2" : "p-4",
        )}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              item.href !== "/clients" &&
              pathname.startsWith(`${item.href}/`)) ||
            (item.href === "/clients" && pathname.startsWith("/clients/"));

          const link = (
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex items-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[var(--shadow-glow)]"
                  : "text-sidebar-foreground/85 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              {active ? (
                <span
                  className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-primary"
                  aria-hidden
                />
              ) : null}
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed ? <span className="truncate">{item.label}</span> : null}
            </Link>
          );

          return (
            <div key={item.href + item.label}>
              {collapsed ? <NavTooltip label={item.label}>{link}</NavTooltip> : link}
            </div>
          );
        })}
      </nav>
      {!collapsed ? (
        <div className="mt-auto shrink-0 border-t border-sidebar-border px-5 py-4">
          <p className="text-sm font-medium text-sidebar-foreground">Bobkat StackScore</p>
          <p className="mt-0.5 text-xs text-sidebar-foreground/75">v{BRAND.productVersion}</p>
          <p className="mt-1 text-xs text-sidebar-foreground/65">
            Powered by {BRAND.companyName}
          </p>
        </div>
      ) : (
        <div className="mt-auto shrink-0 border-t border-sidebar-border px-2 py-3 text-center">
          <p className="text-[10px] font-medium text-sidebar-foreground/70">v{BRAND.productVersion}</p>
        </div>
      )}
    </>
  );
}

export function AppSidebar({
  role,
  clientId,
  collapsed = false,
}: {
  role: string;
  clientId?: string | null;
  collapsed?: boolean;
}) {
  return (
    <aside
      className={cn(
        "hidden h-full min-h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-in-out lg:flex",
        collapsed ? "w-[72px]" : "w-[260px]",
      )}
    >
      <SidebarNav role={role} clientId={clientId ?? null} collapsed={collapsed} />
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
            collapsed={false}
            onNavigate={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
