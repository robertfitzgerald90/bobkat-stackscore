"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { DemoEnvironmentBadge } from "@/components/interactive-demo/demo-environment-badge";
import { DemoExitModal } from "@/components/interactive-demo/demo-exit-modal";
import { DemoPersonalizationLauncher } from "@/components/product-overview/demo-personalization-wizard";
import { useInteractiveDemo } from "@/components/product-overview/interactive-demo-context";
import { ProductOverviewAssessmentCta } from "@/components/product-overview/product-overview-assessment-cta";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  trackDemoAssessmentCtaClicked,
  trackDemoExitClicked,
} from "@/lib/analytics/interactive-demo-events";
import { getDemoSectionLabel } from "@/lib/interactive-demo/routes";
import { readDemoReturnTo } from "@/lib/interactive-demo/session";
import { PRODUCT_OVERVIEW_NAV_ITEMS } from "@/lib/product-overview/navigation";
import { cn } from "@/lib/utils";

export function DemoHeader() {
  const { view } = useInteractiveDemo();
  const [exitOpen, setExitOpen] = useState(false);
  const [returnTo, setReturnTo] = useState<string | null>(null);
  const [activeSectionLabel, setActiveSectionLabel] = useState<string | null>("Overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  const companyName = view.company.name;

  useEffect(() => {
    setReturnTo(readDemoReturnTo());
  }, []);

  useEffect(() => {
    const targets = PRODUCT_OVERVIEW_NAV_ITEMS.filter((item) => item.sectionId).map((item) => ({
      label: item.label,
      sectionId: item.sectionId!,
    }));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0];
        if (!top) return;
        const matched = targets.find((item) => item.sectionId === top.target.id);
        if (matched) {
          setActiveSectionLabel(getDemoSectionLabel(matched.sectionId) ?? matched.label);
        }
      },
      { rootMargin: "-35% 0px -50% 0px", threshold: [0.1, 0.25, 0.5] },
    );

    for (const item of targets) {
      const element = document.getElementById(item.sectionId);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  const subtitle = useMemo(() => {
    const parts = ["Sample company", companyName];
    if (activeSectionLabel) parts.push(activeSectionLabel);
    return parts.join(" · ");
  }, [activeSectionLabel, companyName]);

  function openExit() {
    trackDemoExitClicked("demo_header");
    setExitOpen(true);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <BrandLogo size={32} variant="stacked" className="shrink-0" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold text-foreground">
                  StackScore Interactive Demo
                </p>
                <DemoEnvironmentBadge className="hidden sm:inline-flex" />
              </div>
              <p className="hidden truncate text-xs text-muted-foreground md:block">{subtitle}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <DemoPersonalizationLauncher className="hidden h-9 px-3 text-xs lg:inline-flex sm:h-10 sm:px-4 sm:text-sm" />
            <ProductOverviewAssessmentCta
              label="Get My Assessment"
              placement="demo_header"
              variant="default"
              className="hidden h-9 px-3 text-xs sm:inline-flex sm:h-10 sm:px-4 sm:text-sm"
              onBeforeNavigate={() => trackDemoAssessmentCtaClicked("demo_header")}
            />
            <Button
              type="button"
              variant="outline"
              className="hidden h-9 px-3 text-xs sm:inline-flex sm:h-10 sm:px-4 sm:text-sm"
              onClick={openExit}
            >
              Exit Demo
            </Button>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon" }),
                  "h-9 w-9 sm:hidden",
                )}
                aria-label="Open demo menu"
              >
                <Menu className="h-4 w-4" />
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(20rem,90vw)] bg-background text-foreground">
                <SheetHeader>
                  <SheetTitle>Demo menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-3">
                  <DemoEnvironmentBadge className="w-fit" />
                  <p className="text-sm text-muted-foreground">
                    Sample company:{" "}
                    <span className="font-medium text-foreground">{companyName}</span>
                  </p>
                  {activeSectionLabel ? (
                    <p className="text-sm text-muted-foreground">
                      Current section:{" "}
                      <span className="font-medium text-foreground">{activeSectionLabel}</span>
                    </p>
                  ) : null}
                  <ProductOverviewAssessmentCta
                    label="Get My Assessment"
                    placement="demo_header_mobile"
                    variant="default"
                    className="h-11 w-full justify-center"
                    onBeforeNavigate={() => trackDemoAssessmentCtaClicked("demo_header_mobile")}
                  />
                  <button
                    type="button"
                    className={cn(buttonVariants({ variant: "outline" }), "h-11 w-full")}
                    onClick={() => {
                      setMobileOpen(false);
                      openExit();
                    }}
                  >
                    Exit Demo
                  </button>
                  <Link
                    href="/solutions"
                    className={cn(buttonVariants({ variant: "ghost" }), "h-10 w-full")}
                    onClick={() => setMobileOpen(false)}
                  >
                    Bobkat IT homepage
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <DemoExitModal
        open={exitOpen}
        onOpenChange={setExitOpen}
        returnTo={returnTo}
        onContinue={() => setExitOpen(false)}
      />
    </>
  );
}
