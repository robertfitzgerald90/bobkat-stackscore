"use client";

import Link from "next/link";
import { InteractiveDemoButton } from "@/components/interactive-demo/interactive-demo-button";
import { ServicesCtaLink } from "@/components/services/services-cta-link";
import { trackDemoCtaClicked } from "@/lib/analytics/interactive-demo-events";
import { DEMO_SHORT_DISCLAIMER } from "@/lib/interactive-demo/content";
import { buildDemoHref } from "@/lib/interactive-demo/routes";
import { BOBKAT_IT_URLS } from "@/lib/marketing/bobkat-website";
import { STACKSCORE_PUBLIC_ROUTES } from "@/lib/marketing/stackscore-routes";
import { MARKETING_PANEL, MARKETING_SECTION_COMPACT } from "@/lib/marketing/tokens";

const FOOTER_LINKS = [
  { href: BOBKAT_IT_URLS.solutions, label: "Solutions", external: true as const },
  { href: BOBKAT_IT_URLS.services, label: "Services", external: true as const },
  { href: STACKSCORE_PUBLIC_ROUTES.assessmentOffer, label: "Assessment", external: false as const },
  { href: buildDemoHref({ source: "footer" }), label: "Interactive Demo", demo: true as const },
] as const;

export function OfferFooterWithDemo() {
  return (
    <footer className="relative border-t border-[rgba(70,120,255,0.1)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(70,120,255,0.2)] to-transparent" />
      <div className={MARKETING_SECTION_COMPACT}>
        <div className={cnMarketingPanel()}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Experience StackScore for Yourself
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Explore the interactive client portal using sample business data.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{DEMO_SHORT_DISCLAIMER}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <InteractiveDemoButton
                label="Launch Demo"
                placement="footer"
                variant="default"
                className="h-11 px-6 text-base sm:w-auto"
                captureCurrentPath
              />
              <ServicesCtaLink
                cta="purchaseAssessment"
                label="Get Your Assessment"
                variant="outline"
                className="h-11 px-6 text-base sm:w-auto"
                placement="footer_assessment"
              />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
          >
            {FOOTER_LINKS.map((link) =>
              "demo" in link && link.demo ? (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => trackDemoCtaClicked("footer")}
                >
                  {link.label}
                </Link>
              ) : "external" in link && link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>
          <p className="text-xs text-muted-foreground">Powered by Bobkat IT · StackScore</p>
        </div>
      </div>
    </footer>
  );
}

function cnMarketingPanel() {
  return `${MARKETING_PANEL} mx-auto max-w-6xl p-6 sm:p-8`;
}
