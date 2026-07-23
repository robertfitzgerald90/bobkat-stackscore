import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { MARKETING_AUTH_CARD, MARKETING_AUTH_SHELL } from "@/lib/marketing/tokens";

export default function ForgotPasswordPage() {
  return (
    <PublicPageShell variant="auth">
      <main className={MARKETING_AUTH_SHELL}>
        <div className={`${MARKETING_AUTH_CARD} space-y-6`}>
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and we&apos;ll send you a secure reset link.
            </p>
          </div>
          <ForgotPasswordForm />
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </main>
    </PublicPageShell>
  );
}
