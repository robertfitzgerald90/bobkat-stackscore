import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token ?? "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-8 shadow-sm">
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
  );
}
