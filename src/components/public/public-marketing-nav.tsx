"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
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
import { STACKSCORE_PUBLIC_ROUTES } from "@/lib/marketing/stackscore-routes";
import { PUBLIC_MARKETING_HEADER_CLASS } from "@/lib/ui/sticky-chrome";
import {
  MARKETING_BTN_GLASS,
  MARKETING_NAV_LINK,
  MARKETING_NAV_LINK_ACTIVE,
} from "@/lib/marketing/tokens";
import { cn } from "@/lib/utils";

type PublicMarketingNavProps = {
  active?: "assessment" | "demo" | "checkout" | "home";
};

/**
 * Minimal public chrome for funnel/demo surfaces (SS-BRAND-003).
 * Acquisition checkout/offer routes remain reachable via direct URLs.
 */
export function PublicMarketingNav({ active }: PublicMarketingNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const demoHref = buildDemoHref({ source: "navigation" });

  return (
    <header className={PUBLIC_MARKETING_HEADER_CLASS}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="min-w-0 shrink transition-opacity hover:opacity-90">
          <BrandLogo size={32} showText placement="header" priority className="gap-2" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="StackScore public pages">
          <Link
            href={demoHref}
            className={cn(
              MARKETING_NAV_LINK,
              "inline-flex items-center gap-1.5",
              active === "demo" && MARKETING_NAV_LINK_ACTIVE,
            )}
            onClick={() => trackDemoCtaClicked("navigation")}
          >
            Explore Demo
          </Link>
          <Link
            href={STACKSCORE_PUBLIC_ROUTES.login}
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "marketing-btn-primary ml-2 h-9 px-4 text-xs font-semibold uppercase tracking-[0.12em]",
            )}
          >
            Sign In
          </Link>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href={STACKSCORE_PUBLIC_ROUTES.login}
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "marketing-btn-primary h-9 px-3 text-xs font-semibold uppercase tracking-[0.1em]",
            )}
          >
            Sign In
          </Link>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: "outline", size: "icon" }),
                MARKETING_BTN_GLASS,
                "h-9 w-9",
              )}
              aria-label="Open navigation menu"
            >
              <Menu className="h-4 w-4" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="border-border bg-[rgba(8,9,12,0.98)] text-foreground"
            >
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-4 flex flex-col gap-1" aria-label="Mobile navigation">
                <Link
                  href={demoHref}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active === "demo"
                      ? MARKETING_NAV_LINK_ACTIVE
                      : "text-foreground hover:bg-primary/10",
                  )}
                  onClick={() => {
                    trackDemoCtaClicked("navigation");
                    setMobileOpen(false);
                  }}
                >
                  Explore Demo
                </Link>
                <Link
                  href={STACKSCORE_PUBLIC_ROUTES.login}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-primary/10"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
              </nav>
              <div className="mt-6 flex flex-col gap-3">
                <InteractiveDemoButton
                  label="Explore Demo"
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
