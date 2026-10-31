import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { CornerBrackets } from "@/components/design-system/instrument/corner-brackets";
import { buttonVariants } from "@/components/ui/button";
import { BRAND } from "@/lib/branding";
import { BOBKAT_IT_URLS } from "@/lib/marketing/bobkat-website";
import { STACKSCORE_PUBLIC_ROUTES } from "@/lib/marketing/stackscore-routes";
import { cn } from "@/lib/utils";

/**
 * SS-BRAND-003 / SS-WEB-002 — Minimal StackScore product gateway.
 * Platform access first. Acquisition/checkout routes remain at deep links.
 */
export function StackScoreGatewayHome() {
  const year = new Date().getFullYear();

  return (
    <PublicPageShell>
      <div className="brand-level-2 flex min-h-screen flex-col">
        <header className="relative z-[1] px-4 pt-5 sm:px-6 sm:pt-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <Link href="/" className="min-w-0 transition-opacity hover:opacity-90">
              <BrandLogo
                presentation="navigation"
                size={36}
                showText
                placement="header"
                priority
                className="gap-2"
              />
            </Link>
            <Link
              href={STACKSCORE_PUBLIC_ROUTES.login}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "brand-cta-secondary h-9 px-4 text-xs font-semibold uppercase tracking-[0.12em]",
              )}
            >
              Sign In
            </Link>
          </div>
        </header>

        <main className="relative z-[1] flex flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
            <BrandLogo presentation="hero" priority />

            <p className="mt-6 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-primary sm:mt-7 sm:text-xs">
              {BRAND.productName}
            </p>
            <p className="mt-2 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-muted-foreground sm:text-[0.7rem]">
              By {BRAND.companyName}
            </p>

            <h1 className="marketing-hero-title mt-8 max-w-2xl uppercase tracking-tight">
              Know your technology.
              <br />
              Own your next move.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Understand your technology, identify opportunities, and turn recommendations into
              measurable progress.
            </p>

            <div className="mt-10 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
              <Link
                href={STACKSCORE_PUBLIC_ROUTES.login}
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "brand-cta-gradient h-12 w-full justify-center px-8 text-sm font-semibold uppercase tracking-[0.14em] sm:w-auto",
                )}
              >
                Sign In
              </Link>
              <Link
                href={STACKSCORE_PUBLIC_ROUTES.demo}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "brand-cta-secondary h-12 w-full justify-center px-8 text-sm font-semibold uppercase tracking-[0.14em] sm:w-auto",
                )}
              >
                Explore Demo
              </Link>
            </div>

            <CornerBrackets corners="two" className="mt-14 w-full max-w-lg sm:mt-16">
              <div className="rounded-sm border border-border/70 bg-card/40 px-5 py-4 text-left sm:px-6 sm:py-5">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-primary">
                  Technology intelligence
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Assessment, maturity insight, and execution planning — the StackScore platform
                  used by {BRAND.companyName}.
                </p>
              </div>
            </CornerBrackets>
          </div>
        </main>

        <footer className="relative z-[1] border-t border-border/40 px-4 py-6 sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-center text-xs text-muted-foreground sm:flex-row sm:text-left">
            <p>
              © {year} {BRAND.productName} · Powered by {BRAND.companyName}
            </p>
            <a
              href={BOBKAT_IT_URLS.home}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Visit {BRAND.companyName}
            </a>
          </div>
        </footer>
      </div>
    </PublicPageShell>
  );
}
