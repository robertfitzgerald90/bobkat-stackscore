import { getEmailConfig, logEmailEnvDiagnostics } from "@/lib/email/config";
import { purchaseTrace, purchaseTraceError, purchaseTraceStop } from "@/lib/purchase-trace";

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
  purchaseTrace("S01", "ENTER sendEmail()", {
    to: input.to,
    subject: input.subject,
  });

  logEmailEnvDiagnostics("sendEmail entry");

  const { from, resendApiKey } = getEmailConfig();

  purchaseTrace("S02", "sendEmail config loaded", {
    to: input.to,
    subject: input.subject,
    emailFrom: from,
    resendApiKeyPresent: Boolean(resendApiKey),
    resendApiKeyLength: resendApiKey?.length ?? 0,
  });

  if (!resendApiKey) {
    purchaseTraceStop(
      "S03",
      "send.ts → if (!resendApiKey)",
      "RESEND_API_KEY missing at runtime — returning console fallback, resend.emails.send() NOT called",
      {
        to: input.to,
        subject: input.subject,
        emailFrom: from,
        textPreview: input.text.slice(0, 200),
      },
    );
    return { delivered: true, provider: "console" };
  }

  const resendRequest = {
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  };

  purchaseTrace("S04", "BEFORE resend.emails.send() — full request payload", {
    request: resendRequest,
  });

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(resendApiKey);
    const response = await resend.emails.send(resendRequest);

    purchaseTrace("S05", "AFTER resend.emails.send() — full response", {
      to: input.to,
      response: {
        data: response.data ?? null,
        error: response.error ?? null,
      },
    });

    if (response.error) {
      purchaseTraceError(
        "S06",
        "send.ts → if (response.error)",
        new Error(response.error.message),
        {
          to: input.to,
          resendError: response.error,
        },
      );
      throw new Error(response.error.message);
    }

    purchaseTrace("S07", "EXIT sendEmail() — Resend success", {
      to: input.to,
      messageId: response.data?.id ?? null,
      provider: "resend",
    });

    return {
      delivered: true,
      provider: "resend",
      id: response.data?.id,
    };
  } catch (error) {
    purchaseTraceError("S08", "send.ts → resend.emails.send() catch", error, {
      to: input.to,
      subject: input.subject,
    });
    throw error;
  }
}
