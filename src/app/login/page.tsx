import { Suspense } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { LoginForm } from "@/components/auth/login-form";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { BRAND } from "@/lib/branding";
import { MARKETING_AUTH_CARD, MARKETING_AUTH_SHELL } from "@/lib/marketing/tokens";

export default function LoginPage() {
  const year = new Date().getFullYear();

  return (
    <PublicPageShell variant="auth">
      <main className={`${MARKETING_AUTH_SHELL} py-16 sm:py-20 md:py-24`}>
        <div className="flex w-full max-w-md flex-col items-center">
          <BrandLogo size={88} showText={false} placement="auth" priority />

          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-brand sm:text-4xl">
            {BRAND.productName}
          </h1>
          <p className="mt-1.5 text-base font-medium tracking-wide text-muted-foreground sm:text-lg">
            Client Portal
          </p>
          <p className="mt-5 max-w-sm text-center text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
            Secure access to your technology assessments, reports, roadmap, and Strategic IT
            Consulting workspace.
          </p>

          <div className={`${MARKETING_AUTH_CARD} mt-10 w-full p-8 sm:mt-12 sm:p-10`}>
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>

          <footer className="mt-12 space-y-1 text-center text-xs leading-relaxed text-muted-foreground/75">
            <p>{BRAND.productName} Client Portal</p>
            <p>Powered by {BRAND.companyName}</p>
            <p>© {year}</p>
          </footer>
        </div>
      </main>
    </PublicPageShell>
  );
}
