import { Suspense } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { LoginExecutivePreview } from "@/components/auth/login-executive-preview";
import { LoginForm } from "@/components/auth/login-form";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { EXECUTIVE_OS_TAGLINE } from "@/lib/executive-os/business-language";
import { MARKETING_AUTH_CARD, MARKETING_AUTH_SHELL } from "@/lib/marketing/tokens";

export default function LoginPage() {
  return (
    <PublicPageShell variant="auth">
      <main className={`${MARKETING_AUTH_SHELL} lg:flex-row lg:items-center lg:justify-center lg:gap-12 xl:gap-16`}>
        <div className="flex w-full max-w-md flex-col items-center">
          <BrandLogo size={72} variant="stacked" placement="auth" priority />
          <p className="mt-4 max-w-sm text-center text-sm text-muted-foreground">
            {EXECUTIVE_OS_TAGLINE}
          </p>
          <div className={`${MARKETING_AUTH_CARD} mt-8 w-full p-6 sm:p-8`}>
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>
          <p className="mt-8 text-center text-xs text-muted-foreground">
            Bobkat IT · Technology maturity assessments
          </p>
        </div>
        <LoginExecutivePreview />
      </main>
    </PublicPageShell>
  );
}
