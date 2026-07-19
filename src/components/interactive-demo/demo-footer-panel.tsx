"use client";

import Link from "next/link";
import { InteractiveDemoButton } from "@/components/interactive-demo/interactive-demo-button";
import { ServicesCtaLink } from "@/components/services/services-cta-link";
import { trackDemoCtaClicked } from "@/lib/analytics/interactive-demo-events";
import { DEMO_SHORT_DISCLAIMER } from "@/lib/interactive-demo/content";
import { buildDemoHref } from "@/lib/interactive-demo/routes";

const FOOTER_LINKS = [
  { href: "/solutions", label: "Solutions" },
  { href: "/services", label: "Services" },
  { href: "/assessment-offer", label: "Assessment" },
  { href: buildDemoHref({ source: "footer" }), label: "Interactive Demo", demo: true as const },
] as const;

export function OfferFooterWithDemo() {
  return (
    <footer className="border-t border-border/60 bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Experience StackScore for Yourself
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Explore the interactive client portal using sample business data.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{DEMO_SHORT_DISCLAIMER}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <InteractiveDemoButton
                label="Launch Demo"
                placement="footer"
                variant="default"
                className="h-11 px-6 text-base shadow-md sm:w-auto"
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

        <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
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
