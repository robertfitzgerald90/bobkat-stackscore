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

import { BOBKAT_IT_URLS } from "@/lib/marketing/bobkat-website";

import {

  STACKSCORE_PUBLIC_ROUTES,

  STRATEGIC_IT_CONSULTING_CHECKOUT_PATH,

} from "@/lib/marketing/stackscore-routes";

import { SERVICES_CTA_DESTINATIONS } from "@/lib/services/cta";

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



type NavLink =

  | {

      kind: "internal";

      href: string;

      label: string;

      key: NonNullable<PublicMarketingNavProps["active"]>;

      badge?: string;

    }

  | {

      kind: "external";

      href: string;

      label: string;

      key: string;

    };



const navLinks: NavLink[] = [

  {

    kind: "internal",

    href: STACKSCORE_PUBLIC_ROUTES.assessmentOffer,

    label: "Assessment Offer",

    key: "assessment",

  },

  {

    kind: "internal",

    href: STRATEGIC_IT_CONSULTING_CHECKOUT_PATH,

    label: "Strategic IT Consulting",

    key: "checkout",

  },

  {

    kind: "internal",

    href: buildDemoHref({ source: "navigation" }),

    label: "Interactive Demo",

    key: "demo",

    badge: "LIVE DEMO",

  },

  {

    kind: "external",

    href: BOBKAT_IT_URLS.services,

    label: "Bobkat IT Services",

    key: "bobkat-services",

  },

];



const navLinkClassName = MARKETING_NAV_LINK;



export function PublicMarketingNav({ active }: PublicMarketingNavProps) {

  const [mobileOpen, setMobileOpen] = useState(false);



  return (

    <header className={PUBLIC_MARKETING_HEADER_CLASS}>

      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">

        <Link href="/" className="min-w-0 shrink transition-opacity hover:opacity-90">

          <BrandLogo size={32} showText placement="header" priority className="gap-2" />

        </Link>



        <nav className="hidden items-center gap-1 lg:flex" aria-label="StackScore public pages">

          {navLinks.map((link) => {

            const isActive = link.kind === "internal" && active === link.key;

            const isDemo = link.kind === "internal" && link.key === "demo";

            const className = cn(

              navLinkClassName,

              "inline-flex items-center gap-1.5",

              isActive && MARKETING_NAV_LINK_ACTIVE,

            );



            if (link.kind === "external") {

              return (

                <a key={link.key} href={link.href} className={className}>

                  {link.label}

                </a>

              );

            }



            return (

              <Link

                key={link.href}

                href={link.href}

                className={className}

                onClick={isDemo ? () => trackDemoCtaClicked("navigation") : undefined}

              >

                {link.label}

                {link.badge ? (

                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[0.65rem] font-semibold tracking-wide text-primary">

                    {link.badge}

                  </span>

                ) : null}

              </Link>

            );

          })}

          <Link href={STACKSCORE_PUBLIC_ROUTES.login} className={navLinkClassName}>

            Sign In

          </Link>

        </nav>



        <div className="flex items-center gap-2">

          <TechnologySnapshotLink

            label={SERVICES_CTA_DESTINATIONS.snapshot.label}

            className="hidden h-9 shrink-0 px-3 text-xs sm:inline-flex sm:px-4 sm:text-sm"

            placement={`${active ?? "home"}_nav`}

          />



          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>

            <SheetTrigger

              className={cn(buttonVariants({ variant: "outline", size: "icon" }), MARKETING_BTN_GLASS, "h-9 w-9 lg:hidden")}

              aria-label="Open navigation menu"

            >

              <Menu className="h-4 w-4" />

            </SheetTrigger>

            <SheetContent side="right" className="border-[rgba(70,120,255,0.12)] bg-[rgba(5,9,20,0.98)] text-foreground">

              <SheetHeader>

                <SheetTitle>Menu</SheetTitle>

              </SheetHeader>

              <nav className="mt-4 flex flex-col gap-1" aria-label="Mobile navigation">

                {navLinks.map((link) => {

                  const isActive = link.kind === "internal" && active === link.key;

                  const isDemo = link.kind === "internal" && link.key === "demo";

                  const className = cn(

                    "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",

                    isActive

                      ? MARKETING_NAV_LINK_ACTIVE

                      : "text-foreground hover:bg-[rgba(35,135,255,0.08)]",

                  );



                  if (link.kind === "external") {

                    return (

                      <a

                        key={link.key}

                        href={link.href}

                        className={className}

                        onClick={() => setMobileOpen(false)}

                      >

                        {link.label}

                      </a>

                    );

                  }



                  return (

                    <Link

                      key={link.href}

                      href={link.href}

                      className={className}

                      onClick={() => {

                        if (isDemo) trackDemoCtaClicked("navigation");

                        setMobileOpen(false);

                      }}

                    >

                      <span className="inline-flex items-center gap-2">

                        {link.label}

                        {link.badge ? (

                          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[0.65rem] font-semibold tracking-wide text-primary">

                            {link.badge}

                          </span>

                        ) : null}

                      </span>

                    </Link>

                  );

                })}

                <Link

                  href={STACKSCORE_PUBLIC_ROUTES.login}

                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-[rgba(35,135,255,0.08)]"

                  onClick={() => setMobileOpen(false)}

                >

                  Sign In

                </Link>

              </nav>

              <div className="mt-6 flex flex-col gap-3">

                <TechnologySnapshotLink

                  label={SERVICES_CTA_DESTINATIONS.snapshot.label}

                  className="h-11 w-full justify-center px-4 text-sm"

                  placement={`${active ?? "home"}_nav_mobile`}

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


