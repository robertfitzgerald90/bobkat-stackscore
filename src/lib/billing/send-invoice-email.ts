import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/send";
import { formatMoney } from "@/lib/billing/money";
import { recordBillingAudit } from "@/lib/billing/audit";
import { BRAND } from "@/lib/branding";
import { createInvoiceCheckoutSession } from "@/lib/billing/stripe-checkout";

type SendInvoiceEmailInput = {
  invoiceId: string;
  clientId: string;
  actorUserId: string;
  ccEmails?: string[];
  pdfUrl?: string;
  isReminder?: boolean;
};

export async function sendInvoiceEmail(input: SendInvoiceEmailInput) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: input.invoiceId, clientId: input.clientId },
    include: { client: true },
  });
  if (!invoice) throw new Error("Invoice not found");
  if (!invoice.billToEmail) throw new Error("Invoice has no billing email");

  let paymentUrl = invoice.stripePaymentLinkUrl;
  if (invoice.onlinePaymentEnabled && invoice.balanceDueCents > 0 && !paymentUrl) {
    const session = await createInvoiceCheckoutSession(invoice.id);
    paymentUrl = session.url;
  }

  const viewUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/clients/${invoice.clientId}/billing/invoices/${invoice.id}`;
  const subject = input.isReminder
    ? `Payment reminder — Invoice ${invoice.invoiceNumber}`
    : `Invoice ${invoice.invoiceNumber} from ${BRAND.companyName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; color: #1e293b;">
      <p>Dear ${invoice.billToName ?? invoice.client.companyName},</p>
      <p>${input.isReminder ? "This is a friendly reminder that the following invoice is outstanding." : "Please find your invoice details below."}</p>
      <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding:8px 0; color:#64748b;">Invoice</td><td style="padding:8px 0; font-weight:600;">${invoice.invoiceNumber}</td></tr>
        <tr><td style="padding:8px 0; color:#64748b;">Amount due</td><td style="padding:8px 0; font-weight:600;">${formatMoney(invoice.balanceDueCents)}</td></tr>
        <tr><td style="padding:8px 0; color:#64748b;">Due date</td><td style="padding:8px 0;">${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "—"}</td></tr>
      </table>
      <p style="margin: 24px 0;">
        <a href="${viewUrl}" style="display:inline-block; background:#082f5b; color:#fff; padding:12px 20px; text-decoration:none; border-radius:6px; margin-right:8px;">View invoice</a>
        ${paymentUrl ? `<a href="${paymentUrl}" style="display:inline-block; background:#0a3d75; color:#fff; padding:12px 20px; text-decoration:none; border-radius:6px;">Pay invoice</a>` : ""}
      </p>
      ${input.pdfUrl ? `<p><a href="${input.pdfUrl}">Download PDF</a></p>` : ""}
      <p style="color:#64748b; font-size:13px;">Questions? Contact ${BRAND.email} · ${BRAND.website}</p>
    </div>
  `;

  const text = `Invoice ${invoice.invoiceNumber} — Amount due ${formatMoney(invoice.balanceDueCents)}. View: ${viewUrl}${paymentUrl ? ` Pay: ${paymentUrl}` : ""}`;

  const result = await sendEmail({
    to: invoice.billToEmail,
    subject,
    html,
    text,
  });

  const delivery = await prisma.invoiceDelivery.create({
    data: {
      invoiceId: invoice.id,
      channel: "email",
      status: result.delivered ? "sent" : "failed",
      recipientEmail: invoice.billToEmail,
      ccEmailsJson: input.ccEmails ?? [],
      subject,
      messageId: result.id,
      sentAt: result.delivered ? new Date() : undefined,
      failureReason: result.delivered ? undefined : "Email delivery failed",
    },
  });

  if (result.delivered && ["draft", "ready_to_send"].includes(invoice.status)) {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: "sent", issueDate: invoice.issueDate ?? new Date() },
    });
  }

  await recordBillingAudit({
    clientId: input.clientId,
    invoiceId: invoice.id,
    action: input.isReminder ? "reminder_sent" : "invoice_sent",
    actorUserId: input.actorUserId,
    metadata: { deliveryId: delivery.id, messageId: result.id },
  });

  return { delivery, emailResult: result, paymentUrl };
}
