export type EmailConfig = {
  from: string;
  resendApiKey: string | undefined;
};

export function getEmailConfig(): EmailConfig {
  return {
    from: process.env.EMAIL_FROM?.trim() || "StackScore <onboarding@bobkatit.com>",
    resendApiKey: process.env.RESEND_API_KEY?.trim() || undefined,
  };
}

export function isEmailConfigured(): boolean {
  return Boolean(getEmailConfig().resendApiKey);
}

/** Logs env presence without exposing secrets. */
export function logEmailEnvDiagnostics(context: string): void {
  const rawKey = process.env.RESEND_API_KEY;
  const trimmedKey = rawKey?.trim();
  const { from } = getEmailConfig();

  console.info(`[email/env] ${context}`, {
    resendApiKeyPresent: Boolean(trimmedKey),
    resendApiKeyLength: trimmedKey?.length ?? 0,
    resendApiKeyHadWhitespaceOnly: Boolean(rawKey && !trimmedKey),
    emailFrom: from,
    vercelEnv: process.env.VERCEL_ENV ?? null,
    nodeEnv: process.env.NODE_ENV ?? null,
  });
}
