"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
] ;

type CommunicationsSubnavProps = {
  isAdmin?: boolean;
};

export function CommunicationsSubnav({ isAdmin = false }: CommunicationsSubnavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 border-b border-[#1e3a5f]/20 pb-4">
      {NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
              active
                ? "bg-[#082F5B] text-white shadow-sm"
                : "text-muted-foreground hover:bg-[#082F5B]/8 hover:text-[#082F5B]",
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
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#082F5B]">{title}</h2>
        {description ? <p className="mt-1 max-w-3xl text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function CommunicationsPanel({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-[#1e3a5f]/10 bg-card shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      {title ? (
        <div className="border-b border-[#1e3a5f]/10 bg-[#082F5B]/[0.03] px-5 py-4">
          <h3 className="text-lg font-semibold text-[#082F5B]">{title}</h3>
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
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
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-900",
    neutral: "bg-slate-100 text-slate-700",
    info: "bg-blue-100 text-blue-800",
  };
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", tones[tone])}>
      {children}
    </span>
  );
}
