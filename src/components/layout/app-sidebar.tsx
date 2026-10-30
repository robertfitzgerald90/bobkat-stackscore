"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { canAccessPortfolio } from "@/lib/navigation/default-landing";
import {
  getSidebarNavForRole,
  isSidebarNavItemActive,
  isStaffNavChildActive,
  resolveClientIdFromPathname,
  type SidebarNavChild,
  type SidebarNavItem,
} from "@/lib/navigation/sidebar-nav";
import { isCustomerMode } from "@/lib/navigation/portal-mode";
import { customerAssessmentDashboardPath } from "@/lib/clients/paths";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { BRAND } from "@/lib/branding";
import {
  EXECUTIVE_OS_SIDEBAR_LINK,
  EXECUTIVE_OS_SIDEBAR_LINK_ACTIVE,
  EXECUTIVE_OS_SIDEBAR_LINK_IDLE,
} from "@/lib/executive-os/tokens";
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

function NavBadge({
  count,
  customerMode,
}: {
  count: number;
  customerMode: boolean;
}) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        "inline-flex min-w-5 items-center justify-center bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground",
        customerMode ? "rounded-sm" : "rounded-full",
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

function ActiveRail({ customerMode }: { customerMode: boolean }) {
  return (
    <span
      className={cn(
        "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 bg-sidebar-primary",
        customerMode ? "customer-nav-active-rail rounded-none" : "rounded-r-full",
      )}
      aria-hidden
    />
  );
}

function LeafNavLink({
  item,
  pathname,
  collapsed,
  customerMode,
  onNavigate,
}: {
  item: SidebarNavItem;
  pathname: string;
  collapsed: boolean;
  customerMode: boolean;
  onNavigate?: () => void;
}) {
  const active = isSidebarNavItemActive(pathname, item);
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      className={cn(
        EXECUTIVE_OS_SIDEBAR_LINK,
        customerMode && "rounded-sm",
        collapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-3",
        active ? EXECUTIVE_OS_SIDEBAR_LINK_ACTIVE : EXECUTIVE_OS_SIDEBAR_LINK_IDLE,
      )}
    >
      {active ? <ActiveRail customerMode={customerMode} /> : null}
      <Icon className="h-[1.125rem] w-[1.125rem] shrink-0" />
      {!collapsed ? (
        <span className="flex min-w-0 flex-1 items-center justify-between gap-2 truncate">
          <span className="truncate">{item.label}</span>
          <NavBadge count={item.badgeCount ?? 0} customerMode={customerMode} />
        </span>
      ) : null}
    </Link>
  );

  return collapsed ? <NavTooltip label={item.label}>{link}</NavTooltip> : link;
}

function ChildNavLink({
  child,
  pathname,
  onNavigate,
}: {
  child: SidebarNavChild;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = isStaffNavChildActive(pathname, child);
  const Icon = child.icon;

  return (
    <Link
      href={child.href}
      onClick={onNavigate}
      aria-label={child.label}
      aria-current={active ? "page" : undefined}
      className={cn(
        EXECUTIVE_OS_SIDEBAR_LINK,
        "gap-2 py-2 pl-9 pr-3 text-[0.8125rem]",
        active ? EXECUTIVE_OS_SIDEBAR_LINK_ACTIVE : EXECUTIVE_OS_SIDEBAR_LINK_IDLE,
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
      <span className="flex min-w-0 flex-1 items-center justify-between gap-2 truncate">
        <span className="truncate">{child.label}</span>
        <NavBadge count={child.badgeCount ?? 0} customerMode={false} />
      </span>
    </Link>
  );
}

function GroupNavItem({
  item,
  pathname,
  collapsed,
  onNavigate,
}: {
  item: SidebarNavItem;
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const children = item.children ?? [];
  const primaryActive = isSidebarNavItemActive(pathname, item);
  const childActive = children.some((child) => isStaffNavChildActive(pathname, child));
  const shouldExpand = primaryActive || childActive;
  const [expanded, setExpanded] = useState(shouldExpand);
  const Icon = item.icon;

  useEffect(() => {
    if (shouldExpand) setExpanded(true);
  }, [shouldExpand]);

  if (collapsed) {
    return (
      <NavTooltip label={item.label}>
        <Link
          href={item.href}
          onClick={onNavigate}
          aria-label={item.label}
          aria-current={primaryActive ? "page" : undefined}
          className={cn(
            EXECUTIVE_OS_SIDEBAR_LINK,
            "justify-center px-2 py-3",
            primaryActive ? EXECUTIVE_OS_SIDEBAR_LINK_ACTIVE : EXECUTIVE_OS_SIDEBAR_LINK_IDLE,
          )}
        >
          {primaryActive ? <ActiveRail customerMode={false} /> : null}
          <Icon className="h-[1.125rem] w-[1.125rem] shrink-0" />
        </Link>
      </NavTooltip>
    );
  }

  return (
    <div className="space-y-0.5">
      <div className="flex items-stretch gap-0.5">
        <Link
          href={item.href}
          onClick={onNavigate}
          aria-label={item.label}
          aria-current={primaryActive && !childActive ? "page" : undefined}
          className={cn(
            EXECUTIVE_OS_SIDEBAR_LINK,
            "min-w-0 flex-1 gap-3 px-3 py-3",
            primaryActive ? EXECUTIVE_OS_SIDEBAR_LINK_ACTIVE : EXECUTIVE_OS_SIDEBAR_LINK_IDLE,
          )}
        >
          {primaryActive ? <ActiveRail customerMode={false} /> : null}
          <Icon className="h-[1.125rem] w-[1.125rem] shrink-0" />
          <span className="flex min-w-0 flex-1 items-center justify-between gap-2 truncate">
            <span className="truncate">{item.label}</span>
            <NavBadge count={item.badgeCount ?? 0} customerMode={false} />
          </span>
        </Link>
        <button
          type="button"
          aria-label={`${expanded ? "Collapse" : "Expand"} ${item.label}`}
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          className={cn(
            EXECUTIVE_OS_SIDEBAR_LINK,
            "shrink-0 px-2 py-3",
            EXECUTIVE_OS_SIDEBAR_LINK_IDLE,
          )}
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-150 motion-reduce:transition-none",
              expanded ? "rotate-0" : "-rotate-90",
            )}
            aria-hidden
          />
        </button>
      </div>
      {expanded ? (
        <div role="group" aria-label={`${item.label} destinations`} className="space-y-0.5 pb-1">
          {children.map((child) => (
            <ChildNavLink
              key={child.href + child.label}
              child={child}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SidebarNav({
  role,
  clientId,
  collapsed = false,
  onNavigate,
  navBadges = {},
}: {
  role: string;
  clientId: string | null;
  collapsed?: boolean;
  onNavigate?: () => void;
  navBadges?: Record<string, number>;
}) {
  const pathname = usePathname();
  const pathClientId = resolveClientIdFromPathname(pathname);
  const effectiveClientId = pathClientId ?? clientId;
  const navItems = getSidebarNavForRole(role, effectiveClientId, navBadges);
  const customerMode = isCustomerMode(role);
  const logoHref = canAccessPortfolio(role)
    ? "/portfolio"
    : customerMode && effectiveClientId
      ? customerAssessmentDashboardPath(effectiveClientId)
      : "/dashboard";

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
          placement="sidebar"
          showText={!collapsed}
          collapsed={collapsed}
        />
      </div>
      <nav
        aria-label={customerMode ? "Customer navigation" : "Administrative navigation"}
        className={cn(
          "min-h-0 flex-1 space-y-1 overflow-y-auto transition-[padding] duration-300",
          collapsed ? "p-2" : "p-4",
        )}
      >
        {navItems.map((item) => {
          const key = `${item.id ?? item.href}:${item.label}`;
          if (item.children && item.children.length > 0 && !customerMode) {
            return (
              <GroupNavItem
                key={key}
                item={item}
                pathname={pathname}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            );
          }
          return (
            <div key={key}>
              <LeafNavLink
                item={item}
                pathname={pathname}
                collapsed={collapsed}
                customerMode={customerMode}
                onNavigate={onNavigate}
              />
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
          <p className="text-[10px] font-medium text-sidebar-foreground/70">
            v{BRAND.productVersion}
          </p>
        </div>
      )}
    </>
  );
}

export function AppSidebar({
  role,
  clientId,
  collapsed = false,
  navBadges = {},
}: {
  role: string;
  clientId?: string | null;
  collapsed?: boolean;
  navBadges?: Record<string, number>;
}) {
  return (
    <aside
      className={cn(
        "hidden h-full min-h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-in-out lg:flex",
        collapsed ? "w-[72px]" : "w-[260px]",
      )}
    >
      <SidebarNav role={role} clientId={clientId ?? null} collapsed={collapsed} navBadges={navBadges} />
    </aside>
  );
}

export function MobileSidebar({
  role,
  clientId,
  open,
  onOpenChange,
  navBadges = {},
}: {
  role: string;
  clientId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  navBadges?: Record<string, number>;
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
            navBadges={navBadges}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
