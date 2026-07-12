import { getStripe } from "@/lib/stripe/client";
import { getAppUrl } from "@/lib/stripe/app-url";
import { prisma } from "@/lib/db";

export async function createInvoiceCheckoutSession(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { client: { select: { companyName: true, primaryContactEmail: true } } },
  });
  if (!invoice) throw new Error("Invoice not found");
  if (!invoice.onlinePaymentEnabled) throw new Error("Online payment is disabled for this invoice");
  if (invoice.balanceDueCents <= 0) throw new Error("Invoice has no balance due");

  const stripe = getStripe();
  const appUrl = getAppUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: invoice.billToEmail ?? invoice.client.primaryContactEmail,
    line_items: [
      {
        price_data: {
          currency: invoice.currency,
          unit_amount: invoice.balanceDueCents,
          product_data: {
            name: `Invoice ${invoice.invoiceNumber}`,
            description: `${invoice.client.companyName} — StackScore billing`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/clients/${invoice.clientId}/billing/invoices/${invoice.id}?paid=1`,
    cancel_url: `${appUrl}/clients/${invoice.clientId}/billing/invoices/${invoice.id}`,
    metadata: {
      productType: "stackscore_invoice",
      invoiceId: invoice.id,
      clientId: invoice.clientId,
    },
  });

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      stripeCheckoutSessionId: session.id,
      stripePaymentLinkUrl: session.url,
    },
  });

  return session;
}

export async function isStripeWebhookProcessed(eventId: string): Promise<boolean> {
  const existing = await prisma.stripeWebhookEvent.findUnique({ where: { eventId } });
  return Boolean(existing);
}

export async function markStripeWebhookProcessed(
  eventId: string,
  eventType: string,
  payload?: unknown,
) {
  await prisma.stripeWebhookEvent.create({
    data: {
      eventId,
      eventType,
      payloadJson: payload ? (payload as object) : undefined,
    },
  });
}
