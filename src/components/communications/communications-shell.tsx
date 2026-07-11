"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS: Array<{
  href: string;
  label: string;
  exact: boolean;
  adminOnly?: boolean;
}> = [
  { href: "/admin/communications", label: "Overview", exact: true },
  { href: "/admin/communications/campaigns", label: "Campaigns", exact: false },
  { href: "/admin/communications/prospects", label: "Prospects", exact: false },
  { href: "/admin/communications/templates", label: "Templates", exact: false },
  { href: "/admin/communications/history", label: "History", exact: false },
  { href: "/admin/communications/analytics", label: "Analytics", exact: false },
  { href: "/admin/communications/components", label: "Components", exact: false, adminOnly: true },
  { href: "/admin/communications/variables", label: "Variables", exact: false },
  { href: "/admin/communications/settings", label: "Settings", exact: false, adminOnly: true },
];

type CommunicationsSubnavProps = {
  isAdmin?: boolean;
};

export function CommunicationsSubnav({ isAdmin = false }: CommunicationsSubnavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 border-b border-border pb-4">
      {NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function CommunicationsPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 max-w-full">
        <h2 className="page-title">{title}</h2>
        {description ? <p className="page-description mt-1 max-w-3xl">{description}</p> : null}
      </div>
      {actions ? <div className="action-bar shrink-0">{actions}</div> : null}
    </div>
  );
}

export function CommunicationsSectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}

export function CommunicationsPanel({
  title,
  description,
  children,
  className,
  contentClassName,
  compact = false,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  compact?: boolean;
}) {
  return (
    <section className={cn("stat-card overflow-hidden rounded-xl", className)}>
      {title ? (
        <div className="border-b border-border/70 bg-muted/20 px-5 py-4">
          <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
      ) : null}
      <div className={cn(compact ? "px-5 py-4" : "p-5", contentClassName)}>{children}</div>
    </section>
  );
}

export type CommunicationsMetricItem = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
};

export function CommunicationsMetricsGrid({
  metrics,
  columns = 4,
  className,
}: {
  metrics: CommunicationsMetricItem[];
  columns?: 3 | 4 | 5;
  className?: string;
}) {
  const columnClass =
    columns === 5
      ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      : columns === 3
        ? "sm:grid-cols-2 xl:grid-cols-3"
        : "sm:grid-cols-2 xl:grid-cols-4";

  return (
    <div className={cn("grid gap-3", columnClass, className)}>
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div key={metric.label} className="stat-card rounded-xl p-4">
            <div className="flex items-center gap-2">
              {Icon ? <Icon className="size-4 shrink-0 text-accent-blue" aria-hidden /> : null}
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {metric.label}
              </p>
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{metric.value}</p>
          </div>
        );
      })}
    </div>
  );
}

export function CommunicationsEmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="py-10 text-center">
      <p className="font-medium text-foreground">{title}</p>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}

export function StatusPill({
  tone,
  children,
}: {
  tone: "success" | "warning" | "neutral" | "info";
  children: React.ReactNode;
}) {
  const tones = {
    success: "border border-success/30 bg-success/10 text-success",
    warning: "border border-warning/30 bg-warning/10 text-warning",
    neutral: "border border-border bg-muted/50 text-secondary-token",
    info: "border border-accent-blue/30 bg-accent-blue/10 text-accent-blue",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
