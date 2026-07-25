import Link from "next/link";
import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Clock, Loader2, Mail } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { buttonVariants } from "@/components/ui/button";
import { BRAND } from "@/lib/branding";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { MARKETING_AUTH_SHELL, MARKETING_PANEL } from "@/lib/marketing/tokens";
import { cn } from "@/lib/utils";

export type ConfirmationStep = {
  title: string;
  description: string;
};

type ConfirmationPageProps = {
  eyebrow: string;
  headline: string;
  supportingText: string;
  steps: ConfirmationStep[];
  supportNote: ReactNode;
  primaryCta: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
  variant?: "success" | "pending" | "invalid" | "verifying";
  tracker?: ReactNode;
};

function StatusIcon({ variant }: { variant: NonNullable<ConfirmationPageProps["variant"]> }) {
  if (variant === "verifying") {
    return <Loader2 className="h-7 w-7 animate-spin motion-reduce:animate-none" aria-hidden />;
  }
  if (variant === "pending") {
    return <Clock className="h-7 w-7" aria-hidden />;
  }
  if (variant === "invalid") {
    return <AlertCircle className="h-7 w-7" aria-hidden />;
  }
  return <CheckCircle2 className="h-7 w-7" aria-hidden />;
}

export function ConfirmationPage({
  eyebrow,
  headline,
  supportingText,
  steps,
  supportNote,
  primaryCta,
  secondaryCta = { href: "/", label: "Return to StackScore" },
  variant = "success",
  tracker,
}: ConfirmationPageProps) {
  const isSuccess = variant === "success";

  return (
    <PublicPageShell variant="auth">
      {tracker}
      <main className={cn(MARKETING_AUTH_SHELL, "py-12 sm:py-16")}>
        <div className="mb-8 flex justify-center">
          <BrandLogo size={56} showText={false} placement="auth" priority />
        </div>

        <article
          className={cn(MARKETING_PANEL, "mx-auto w-full max-w-2xl p-6 sm:p-8 md:p-10")}
          aria-labelledby="confirmation-headline"
        >
          <div className="flex flex-col items-center text-center">
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl",
                variant === "invalid"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-primary/10 text-primary",
              )}
            >
              <StatusIcon variant={variant} />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              {eyebrow}
            </p>
            <h1
              id="confirmation-headline"
              className="mt-3 max-w-xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
            >
              {headline}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {supportingText}
            </p>
          </div>

          {isSuccess || variant === "pending" ? (
            <ol className="mt-8 space-y-4 text-left">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="flex gap-4 rounded-xl border border-border/60 bg-background/40 p-4"
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{step.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : null}

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-border/50 bg-muted/20 p-4 text-left text-sm text-muted-foreground">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <p className="leading-relaxed">{supportNote}</p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href={primaryCta.href} className={buttonVariants({ className: "h-11 px-6" })}>
              {primaryCta.label}
            </Link>
            {secondaryCta.href !== primaryCta.href || secondaryCta.label !== primaryCta.label ? (
              <Link
                href={secondaryCta.href}
                className={buttonVariants({ variant: "outline", className: "h-11 px-6" })}
              >
                {secondaryCta.label}
              </Link>
            ) : null}
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground/80">
            {BRAND.productName} · Powered by {BRAND.companyName}
          </p>
        </article>
      </main>
    </PublicPageShell>
  );
}
