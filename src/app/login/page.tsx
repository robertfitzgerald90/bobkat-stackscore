import { Suspense } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/50 p-6">
      <div className="mb-8">
        <BrandLogo size={72} variant="stacked" />
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
      <p className="mt-8 text-center text-xs text-muted-foreground">
        Bobkat IT · Technology maturity assessments
      </p>
    </main>
  );
}
