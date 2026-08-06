import { Suspense } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ActivateAccountForm } from "@/components/auth/activate-account-form";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { CornerBrackets } from "@/components/design-system/instrument/corner-brackets";
import { MARKETING_AUTH_SHELL } from "@/lib/marketing/tokens";

export default function ActivateAccountPage() {
  return (
    <PublicPageShell variant="auth">
      <main className={MARKETING_AUTH_SHELL}>
        <div className="mb-8">
          <BrandLogo size={72} variant="stacked" placement="auth" priority />
        </div>
        <CornerBrackets corners="two" className="w-full max-w-md">
          <Suspense>
            <ActivateAccountForm />
          </Suspense>
        </CornerBrackets>
      </main>
    </PublicPageShell>
  );
}
