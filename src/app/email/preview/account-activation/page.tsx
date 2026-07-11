import { notFound, redirect } from "next/navigation";
import { renderEmailTemplate } from "@/emails/render-email";
import { AccountActivationEmail } from "@/emails/templates/account-activation";
import { auth } from "@/lib/auth";
import { buildSampleActivationUrl } from "@/lib/email/templates/assessment-purchase";
import { isConsultantMode } from "@/lib/navigation/portal-mode";

export default async function AccountActivationEmailPreviewPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isConsultantMode(session.user.role)) redirect("/dashboard");

  const activationUrl = buildSampleActivationUrl();
  const { html } = await renderEmailTemplate(
    AccountActivationEmail({ activationUrl }),
  );

  if (!html) notFound();

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Email Preview</h1>
            <p className="text-sm text-muted-foreground">Account Activation template</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Consultant preview only · sample activation URL
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <iframe
          title="Account Activation Email Preview"
          srcDoc={html}
          className="h-[920px] w-full rounded-xl border border-border bg-white shadow-sm"
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
}
