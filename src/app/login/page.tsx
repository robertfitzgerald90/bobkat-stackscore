import { Suspense } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { LoginForm } from "@/components/auth/login-form";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { CornerBrackets } from "@/components/design-system/instrument/corner-brackets";
import { BRAND } from "@/lib/branding";
import { MARKETING_AUTH_CARD, MARKETING_AUTH_SHELL } from "@/lib/marketing/tokens";

export default function LoginPage() {
  const year = new Date().getFullYear();

  return (
    <PublicPageShell variant="auth">
      <main className={`${MARKETING_AUTH_SHELL} brand-level-2 py-16 sm:py-20 md:py-24`}>
        <div className="flex w-full max-w-md flex-col items-center">
          <Link href="/" className="transition-opacity hover:opacity-90">
            <BrandLogo size={88} showText={false} placement="auth" priority />
          </Link>

          <h1 className="mt-6 text-3xl font-semibold uppercase tracking-[0.08em] text-foreground sm:text-4xl">
            {BRAND.productName}
          </h1>
          <p className="mt-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            By {BRAND.companyName}
          </p>
          <p className="mt-5 max-w-sm text-center text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
            Secure access to assessments, reports, roadmap, and your technology intelligence
            workspace.
          </p>

          <CornerBrackets corners="two" className="mt-10 w-full sm:mt-12">
            <div className={`${MARKETING_AUTH_CARD} p-8 sm:p-10`}>
              <Suspense>
                <LoginForm />
              </Suspense>
            </div>
          </CornerBrackets>

          <footer className="mt-12 space-y-1 text-center text-xs leading-relaxed text-muted-foreground/75">
            <p>
              {BRAND.productName} · Powered by {BRAND.companyName}
            </p>
            <p>© {year}</p>
          </footer>
        </div>
      </main>
    </PublicPageShell>
  );
}
