"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { DemoEnvironmentBadge } from "@/components/interactive-demo/demo-environment-badge";
import { buttonClassName } from "@/components/ui/button";
import { CUSTOMER_PORTAL_THEME_CLASS } from "@/lib/customer-portal/theme";
import { BOBKAT_IT_URLS } from "@/lib/marketing/bobkat-website";
import {
  PUBLIC_DEMO_COMPANY_NAME,
  PUBLIC_DEMO_ENVIRONMENT_LABEL,
  PUBLIC_DEMO_ENVIRONMENT_SUPPORT,
  PUBLIC_DEMO_SAMPLE_NOTICE,
} from "@/lib/public-demo/constants";
import {
  PUBLIC_DEMO_PRIMARY_NAV,
  isPublicDemoNavActive,
} from "@/lib/public-demo/routes";
import { cn } from "@/lib/utils";

type PublicDemoShellProps = {
  children: React.ReactNode;
};

export function PublicDemoShell({ children }: PublicDemoShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div
      className={cn(
        CUSTOMER_PORTAL_THEME_CLASS,
        "flex min-h-screen bg-background text-foreground",
      )}
    >
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card/80 backdrop-blur-sm transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
        aria-label="Demo navigation"
      >
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-4">
          <BrandLogo
            variant="sidebar"
            placement="sidebar"
            href="/demo/overview"
            showText
            priority
          />
          <button
            type="button"
            className="rounded-sm p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2 border-b border-border px-4 py-3">
          <DemoEnvironmentBadge
            label={PUBLIC_DEMO_ENVIRONMENT_LABEL}
            className="rounded-sm text-[10px]"
          />
          <p className="text-xs leading-relaxed text-muted-foreground">
            {PUBLIC_DEMO_ENVIRONMENT_SUPPORT}
          </p>
          <p className="text-[11px] font-medium text-foreground/80">
            {PUBLIC_DEMO_COMPANY_NAME}
            <span className="text-muted-foreground"> · sample</span>
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3" aria-label="Customer demo sections">
          {PUBLIC_DEMO_PRIMARY_NAV.map((item) => {
            const Icon = item.icon;
            const active = isPublicDemoNavActive(pathname, item);
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "relative flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                {active ? (
                  <span
                    className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 bg-primary"
                    aria-hidden
                  />
                ) : null}
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-border p-4">
          <Link href="/login" className={buttonClassName({ className: "w-full" })}>
            Sign in to StackScore
          </Link>
          <a
            href={BOBKAT_IT_URLS.home}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Visit Bobkat IT
          </a>
        </div>
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          aria-label="Close navigation overlay"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-sm sm:px-6">
          <button
            type="button"
            className="rounded-sm p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              StackScore
              <span className="ml-2 font-medium tracking-normal text-muted-foreground">
                by Bobkat IT
              </span>
            </p>
            <p className="truncate text-xs text-muted-foreground">{PUBLIC_DEMO_SAMPLE_NOTICE}</p>
          </div>
          <Link
            href="/login"
            className={buttonClassName({ variant: "outline", size: "sm", className: "shrink-0" })}
          >
            Sign in
          </Link>
        </header>

        <main className="customer-portal-main flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
