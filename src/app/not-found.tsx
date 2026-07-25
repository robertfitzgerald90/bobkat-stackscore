import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { buttonVariants } from "@/components/ui/button";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { BRAND } from "@/lib/branding";
import { MARKETING_AUTH_SHELL, MARKETING_PANEL } from "@/lib/marketing/tokens";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <PublicPageShell variant="auth">
      <main className={cn(MARKETING_AUTH_SHELL, "py-16")}>
        <div className="mb-8 flex justify-center">
          <BrandLogo size={56} showText={false} placement="auth" priority />
        </div>

        <div className={cn(MARKETING_PANEL, "mx-auto w-full max-w-lg p-8 text-center sm:p-10")}>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Page not found
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            We couldn’t find that page
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            The link may be outdated, mistyped, or no longer available. If you were trying to
            purchase or start an assessment, use one of the options below.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/" className={buttonVariants({ className: "h-11 px-6" })}>
              Return Home
            </Link>
            <Link
              href="/login"
              className={buttonVariants({ variant: "outline", className: "h-11 px-6" })}
            >
              Sign In
            </Link>
          </div>

          <div className="mt-3">
            <Link
              href="/assessment-offer"
              className={buttonVariants({ variant: "ghost", className: "h-11 px-6" })}
            >
              Technology Maturity Assessment
            </Link>
          </div>

          <p className="mt-8 text-xs text-muted-foreground/80">
            {BRAND.productName} · Need help?{" "}
            <Link
              href={`mailto:${BRAND.email}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {BRAND.email}
            </Link>
          </p>
        </div>
      </main>
    </PublicPageShell>
  );
}
