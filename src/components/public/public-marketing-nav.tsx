"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { TechnologySnapshotLink } from "@/components/assessment-offer/technology-snapshot-link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { InteractiveDemoButton } from "@/components/interactive-demo/interactive-demo-button";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { trackDemoCtaClicked } from "@/lib/analytics/interactive-demo-events";
import { buildDemoHref } from "@/lib/interactive-demo/routes";
import { SERVICES_CTA_DESTINATIONS } from "@/lib/services/cta";
import { STICKY_SITE_HEADER_CLASS } from "@/lib/ui/sticky-chrome";
import { cn } from "@/lib/utils";

type PublicMarketingNavProps = {
  active: "solutions" | "services" | "assessment" | "demo";
};

const navLinks = [
  { href: "/solutions", label: "Solutions", key: "solutions" },
  { href: "/services", label: "Services", key: "services" },
  { href: "/assessment-offer", label: "Assessment", key: "assessment" },
  {
    href: buildDemoHref({ source: "navigation" }),
    label: "Interactive Demo",
    key: "demo",
    badge: "LIVE DEMO",
  },
] as const;

const navLinkClassName =
  "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground";

export function PublicMarketingNav({ active }: PublicMarketingNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className={STICKY_SITE_HEADER_CLASS}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/solutions" className="min-w-0 shrink transition-opacity hover:opacity-90">
          <BrandLogo size={32} showText className="gap-2" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Bobkat IT public pages">
          {navLinks.map((link) => {
            const isActive = active === link.key;
            const isDemo = link.key === "demo";
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  navLinkClassName,
                  "inline-flex items-center gap-1.5",
                  isActive &&
                    "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
                )}
                onClick={isDemo ? () => trackDemoCtaClicked("navigation") : undefined}
              >
                {link.label}
                {"badge" in link && link.badge ? (
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[0.65rem] font-semibold tracking-wide text-primary">
                    {link.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <TechnologySnapshotLink
            label={SERVICES_CTA_DESTINATIONS.snapshot.label}
            className="hidden h-9 shrink-0 px-3 text-xs sm:inline-flex sm:px-4 sm:text-sm"
            placement={`${active}_nav`}
          />

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className={cn(buttonVariants({ variant: "outline", size: "icon" }), "h-9 w-9 lg:hidden")}
              aria-label="Open navigation menu"
            >
              <Menu className="h-4 w-4" />
            </SheetTrigger>
            <SheetContent side="right" className="bg-background text-foreground">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-4 flex flex-col gap-1" aria-label="Mobile navigation">
                {navLinks.map((link) => {
                  const isActive = active === link.key;
                  const isDemo = link.key === "demo";
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted",
                      )}
                      onClick={() => {
                        if (isDemo) trackDemoCtaClicked("navigation");
                        setMobileOpen(false);
                      }}
                    >
                      <span className="inline-flex items-center gap-2">
                        {link.label}
                        {"badge" in link && link.badge ? (
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[0.65rem] font-semibold tracking-wide text-primary">
                            {link.badge}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-6 flex flex-col gap-3">
                <TechnologySnapshotLink
                  label={SERVICES_CTA_DESTINATIONS.snapshot.label}
                  className="h-11 w-full justify-center px-4 text-sm"
                  placement={`${active}_nav_mobile`}
                />
                <InteractiveDemoButton
                  label="Launch Interactive Demo"
                  placement="navigation_mobile"
                  variant="default"
                  className="h-11 w-full justify-center"
                  captureCurrentPath
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
