import { Suspense } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ActivateAccountForm } from "@/components/auth/activate-account-form";

export default function ActivateAccountPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/50 p-6">
      <div className="mb-8">
        <BrandLogo size={72} variant="stacked" />
      </div>
      <Suspense>
        <ActivateAccountForm />
      </Suspense>
    </main>
  );
}
