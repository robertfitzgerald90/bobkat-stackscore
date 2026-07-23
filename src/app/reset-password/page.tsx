import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { MARKETING_AUTH_CARD, MARKETING_AUTH_SHELL } from "@/lib/marketing/tokens";

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token ?? "";

  return (
    <PublicPageShell variant="auth">
      <main className={MARKETING_AUTH_SHELL}>
        <div className={`${MARKETING_AUTH_CARD} space-y-6`}>
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Create a new password</h1>
            <p className="text-sm text-muted-foreground">
              Choose a strong password for your StackScore account.
            </p>
          </div>
          <ResetPasswordForm token={token} />
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
