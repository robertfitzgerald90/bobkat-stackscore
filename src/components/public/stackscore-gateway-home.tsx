import Link from "next/link";
import { ArrowRight, BarChart3, LogIn, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { buttonVariants } from "@/components/ui/button";
import { BOBKAT_IT_URLS } from "@/lib/marketing/bobkat-website";
import {
  STACKSCORE_PUBLIC_ROUTES,
  STRATEGIC_IT_CONSULTING_CHECKOUT_PATH,
} from "@/lib/marketing/stackscore-routes";
import {
  MARKETING_AUTH_CARD,
  MARKETING_BTN_PRIMARY,
  MARKETING_PANEL,
  MARKETING_SECTION_COMPACT,
} from "@/lib/marketing/tokens";
import { cn } from "@/lib/utils";

const gatewayActions = [
  {
    title: "Client Sign In",
    description: "Access assessments, reports, living execution plans, and your client portal.",
    href: STACKSCORE_PUBLIC_ROUTES.login,
    label: "Sign In",
    icon: LogIn,
    primary: true,
  },
  {
    title: "Strategic IT Consulting",
    description:
      "Start recurring advisory with StackScore included as your technology planning portal.",
    href: STRATEGIC_IT_CONSULTING_CHECKOUT_PATH,
    label: "Start Strategic IT Consulting",
    icon: BarChart3,
    primary: false,
  },
  {
    title: "Technology Assessment",
    description: "Purchase or start the StackScore Technology Maturity Assessment.",
    href: STACKSCORE_PUBLIC_ROUTES.assessmentOffer,
    label: "Take the Technology Assessment",
    icon: Sparkles,
    primary: false,
  },
] as const;

export function StackScoreGatewayHome() {
  return (
    <PublicPageShell>
      <main className="px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14">
        <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
          <BrandLogo size={56} variant="stacked" placement="auth" priority />
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Technology planning powered by StackScore
          </p>
          <h1 className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Assessment, planning, and client portal platform
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            StackScore is the assessment, planning, and client portal platform used by Bobkat IT.
            Sign in, start advisory checkout, or explore the product demo.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl gap-4 md:grid-cols-3">
          {gatewayActions.map((action) => (
            <div key={action.title} className={cn(MARKETING_AUTH_CARD, "flex h-full flex-col p-6 text-left")}>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <action.icon className="h-5 w-5" aria-hidden />
              </div>
              <h2 className="mt-5 text-lg font-semibold tracking-tight">{action.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {action.description}
              </p>
              <Link
                href={action.href}
                className={cn(
                  buttonVariants({ variant: action.primary ? "default" : "outline" }),
                  action.primary ? MARKETING_BTN_PRIMARY : undefined,
                  "mt-6 h-11 w-full justify-center",
                )}
              >
                {action.label}
              </Link>
            </div>
          ))}
        </div>

        <section className={cn(MARKETING_SECTION_COMPACT, "mx-auto mt-12 max-w-6xl")}>
          <div className={cn(MARKETING_PANEL, "p-6 sm:p-8")}>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl text-left">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  Explore the interactive StackScore demo
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Walk through sample executive dashboards, recommendations, living execution plans,
                  and project tracking without signing in.
                </p>
              </div>
              <Link
                href={STACKSCORE_PUBLIC_ROUTES.demo}
                className={cn(buttonVariants({ variant: "default" }), MARKETING_BTN_PRIMARY, "h-11 px-6")}
              >
                Launch Interactive Demo
              </Link>
            </div>
          </div>
        </section>

        <div className="mx-auto mt-12 flex max-w-6xl flex-col items-center gap-4 border-t border-border/60 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Consulting, managed services, and solution details live on Bobkat IT.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={BOBKAT_IT_URLS.services}
              className={cn(buttonVariants({ variant: "outline" }), "h-10 px-4")}
            >
              Learn about services
            </a>
            <a
              href={BOBKAT_IT_URLS.strategicItConsulting}
              className={cn(buttonVariants({ variant: "outline" }), "h-10 px-4")}
            >
              Learn about Strategic IT Consulting
            </a>
            <a
              href={BOBKAT_IT_URLS.solutions}
              className={cn(buttonVariants({ variant: "outline" }), "h-10 px-4")}
            >
              Learn about solutions
            </a>
            <a
              href={BOBKAT_IT_URLS.home}
              className={cn(buttonVariants({ variant: "ghost" }), "h-10 px-4")}
            >
              Visit Bobkat IT
              <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>
      </main>
    </PublicPageShell>
  );
}
