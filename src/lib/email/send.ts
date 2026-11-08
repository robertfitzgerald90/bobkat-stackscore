import { getEmailConfig, logEmailEnvDiagnostics } from "@/lib/email/config";
import { purchaseTrace, purchaseTraceError, purchaseTraceStop } from "@/lib/purchase-trace";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type SendEmailResult = {
  /** True only after Resend accepts the API call. Delivery is recorded later from webhooks. */
  delivered: boolean;
  provider: "resend" | "console";
  id?: string;
};

function emailDiagnostic(to: string): { recipientDomain: string } {
  const domain = to.split("@")[1]?.trim().toLowerCase();
  return { recipientDomain: domain || "unknown" };
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  purchaseTrace("S01", "ENTER sendEmail()", {
    ...emailDiagnostic(input.to),
    subject: input.subject,
  });

  logEmailEnvDiagnostics("sendEmail entry");

  const { from, resendApiKey } = getEmailConfig();

  purchaseTrace("S02", "sendEmail config loaded", {
    ...emailDiagnostic(input.to),
    subject: input.subject,
    resendApiKeyPresent: Boolean(resendApiKey),
  });

  if (!resendApiKey) {
    purchaseTraceStop(
      "S03",
      "send.ts → if (!resendApiKey)",
      "RESEND_API_KEY missing at runtime — resend.emails.send() NOT called",
      {
        ...emailDiagnostic(input.to),
        subject: input.subject,
        provider: "console",
      },
    );
    return { delivered: false, provider: "console" };
  }

  const resendRequest = {
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  };

  purchaseTrace("S04", "BEFORE resend.emails.send()", {
    provider: "resend",
    ...emailDiagnostic(input.to),
    subject: input.subject,
  });

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(resendApiKey);
    const response = await resend.emails.send(resendRequest);

    purchaseTrace("S05", "AFTER resend.emails.send()", {
      ...emailDiagnostic(input.to),
      provider: "resend",
      messageId: response.data?.id ?? null,
      errorName: response.error?.name ?? null,
    });

    if (response.error) {
      purchaseTraceError(
        "S06",
        "send.ts → if (response.error)",
        new Error(response.error.message),
        {
          ...emailDiagnostic(input.to),
          provider: "resend",
        },
      );
      throw new Error(response.error.message);
    }

    purchaseTrace("S07", "EXIT sendEmail() — Resend success", {
      ...emailDiagnostic(input.to),
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
      ...emailDiagnostic(input.to),
      subject: input.subject,
      provider: "resend",
    });
    throw error;
  }
}
