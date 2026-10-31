"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { CustomerPortalWatermark } from "@/components/customer-portal/customer-portal-watermark";
import { DemoEnvironmentBadge } from "@/components/interactive-demo/demo-environment-badge";
import { Button, buttonClassName } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { BRAND } from "@/lib/branding";
import {
  CUSTOMER_PORTAL_MAIN_CLASS,
  CUSTOMER_PORTAL_THEME_CLASS,
} from "@/lib/customer-portal/theme";
import {
  EXECUTIVE_OS_SIDEBAR_LINK,
  EXECUTIVE_OS_SIDEBAR_LINK_ACTIVE,
  EXECUTIVE_OS_SIDEBAR_LINK_IDLE,
} from "@/lib/executive-os/tokens";
import {
  PUBLIC_DEMO_COMPANY_NAME,
  PUBLIC_DEMO_ENVIRONMENT_LABEL,
  PUBLIC_DEMO_ENVIRONMENT_SUPPORT,
  PUBLIC_DEMO_SAMPLE_NOTICE,
} from "@/lib/public-demo/constants";
import { getPublicDemoPageTitle } from "@/lib/public-demo/presentation";
import {
  PUBLIC_DEMO_OVERVIEW_PATH,
  PUBLIC_DEMO_PRIMARY_NAV,
  isPublicDemoNavActive,
  type PublicDemoNavItem,
} from "@/lib/public-demo/routes";
import { cn } from "@/lib/utils";

type PublicDemoShellProps = {
  children: React.ReactNode;
};

/**
 * SS-WEB-003-R1 — Customer-portal chrome for the public demo.
 * Mirrors DashboardShell + AppSidebar customer presentation tokens without
 * requiring an authenticated session or staff command palette.
 */
export function PublicDemoShell({ children }: PublicDemoShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pageTitle = getPublicDemoPageTitle(pathname);

  return (
    <div
      className={cn(
        "executive-os flex h-screen min-h-screen overflow-hidden bg-background",
        CUSTOMER_PORTAL_THEME_CLASS,
      )}
      data-portal="customer"
      data-demo-environment="true"
    >
      <aside
        className="hidden h-full min-h-screen w-[260px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex"
        aria-label="Demo navigation"
      >
        <DemoSidebarNav pathname={pathname} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="flex h-full w-[min(100%,280px)] flex-col gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground sm:max-w-xs"
        >
          <div className="flex h-full min-h-0 flex-col">
            <DemoSidebarNav
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header
          data-customer-header="true"
          data-demo-header="true"
          className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 shadow-[var(--shadow-glow)] lg:h-16 lg:px-6"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <BrandLogo
              showText={false}
              size={32}
              placement="header"
              priority
              className="shrink-0 lg:hidden"
            />
            <div className="min-w-0 lg:hidden">
              <h1 className="truncate text-base font-semibold text-primary">{pageTitle}</h1>
            </div>
            <div className="hidden min-w-0 lg:block">
              <p className="text-sm font-medium text-brand">Technology Maturity Assessments</p>
              <p className="truncate text-xs text-muted-foreground">
                {PUBLIC_DEMO_COMPANY_NAME}
                <span className="text-muted-foreground/80"> · sample workspace</span>
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <DemoEnvironmentBadge
              label={PUBLIC_DEMO_ENVIRONMENT_LABEL}
              className="hidden rounded-sm text-[10px] sm:inline-flex"
            />
            <Link
              href="/login"
              className={buttonClassName({ variant: "outline", size: "sm" })}
            >
              Sign in
            </Link>
          </div>
        </header>

        <div className={cn("relative min-h-0 min-w-0 flex-1", CUSTOMER_PORTAL_MAIN_CLASS)}>
          <CustomerPortalWatermark />
          <main
            className={cn(
              "page-content customer-portal-content relative z-[1] h-full min-w-0 overflow-y-auto overflow-x-clip p-4 sm:p-6 lg:p-8",
            )}
          >
            <p className="sr-only">{PUBLIC_DEMO_SAMPLE_NOTICE}</p>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

function DemoSidebarNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="shrink-0 border-b border-sidebar-border px-5 py-5">
        <BrandLogo
          href={PUBLIC_DEMO_OVERVIEW_PATH}
          size={44}
          variant="sidebar"
          placement="sidebar"
          showText
          priority
        />
      </div>

      <div className="space-y-2 border-b border-sidebar-border px-5 py-3">
        <DemoEnvironmentBadge
          label={PUBLIC_DEMO_ENVIRONMENT_LABEL}
          className="rounded-sm text-[10px]"
        />
        <p className="text-xs leading-relaxed text-sidebar-foreground/75">
          {PUBLIC_DEMO_ENVIRONMENT_SUPPORT}
        </p>
      </div>

      <nav
        aria-label="Customer navigation"
        className="min-h-0 flex-1 space-y-1 overflow-y-auto p-4"
      >
        {PUBLIC_DEMO_PRIMARY_NAV.map((item) => (
          <DemoNavLink
            key={item.id}
            item={item}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="mt-auto shrink-0 space-y-3 border-t border-sidebar-border px-5 py-4">
        <div>
          <p className="text-sm font-medium text-sidebar-foreground">Bobkat StackScore</p>
          <p className="mt-0.5 text-xs text-sidebar-foreground/75">v{BRAND.productVersion}</p>
          <p className="mt-1 text-xs text-sidebar-foreground/65">
            Powered by {BRAND.companyName}
          </p>
        </div>
        <Link href="/login" className={buttonClassName({ className: "w-full" })}>
          Sign in to StackScore
        </Link>
      </div>
    </>
  );
}

function DemoNavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: PublicDemoNavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = isPublicDemoNavActive(pathname, item);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      className={cn(
        EXECUTIVE_OS_SIDEBAR_LINK,
        "rounded-sm gap-3 px-3 py-3",
        active ? EXECUTIVE_OS_SIDEBAR_LINK_ACTIVE : EXECUTIVE_OS_SIDEBAR_LINK_IDLE,
      )}
    >
      {active ? (
        <span
          className="customer-nav-active-rail absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-none bg-sidebar-primary"
          aria-hidden
        />
      ) : null}
      <Icon className="h-[1.125rem] w-[1.125rem] shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}
