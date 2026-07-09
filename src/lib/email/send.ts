import { getEmailConfig, logEmailEnvDiagnostics } from "@/lib/email/config";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type SendEmailResult = {
  delivered: boolean;
  provider: "resend" | "console";
  id?: string;
};

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  logEmailEnvDiagnostics("sendEmail entry");

  const { from, resendApiKey } = getEmailConfig();

  console.info("[email/send] >>> ENTER sendEmail()", {
    to: input.to,
    subject: input.subject,
    resendApiKeyPresent: Boolean(resendApiKey),
    resendApiKeyLength: resendApiKey?.length ?? 0,
    emailFrom: from,
  });

  if (!resendApiKey) {
    console.warn("[email/send] <<< EXIT sendEmail() — RESEND_API_KEY missing, console fallback only (Resend NOT called)", {
      to: input.to,
      subject: input.subject,
      emailFrom: from,
      textPreview: input.text.slice(0, 200),
    });
    return { delivered: true, provider: "console" };
  }

  console.info("[email/send] >>> BEFORE resend.emails.send()", {
    to: input.to,
    subject: input.subject,
    emailFrom: from,
  });

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(resendApiKey);
    const response = await resend.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    console.info("[email/send] <<< AFTER resend.emails.send() — raw response received", {
      to: input.to,
      hasError: Boolean(response.error),
      messageId: response.data?.id ?? null,
      error: response.error ?? null,
    });

    if (response.error) {
      console.error("[email/send] <<< Resend response.error — throwing", {
        to: input.to,
        subject: input.subject,
        error: response.error,
      });
      throw new Error(response.error.message);
    }

    console.info("[email/send] <<< EXIT sendEmail() — Resend success", {
      to: input.to,
      subject: input.subject,
      messageId: response.data?.id ?? null,
    });

    return {
      delivered: true,
      provider: "resend",
      id: response.data?.id,
    };
  } catch (error) {
    console.error("[email/send] <<< CAUGHT ERROR in sendEmail()", {
      to: input.to,
      subject: input.subject,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      error,
    });
    throw error;
  }
}
