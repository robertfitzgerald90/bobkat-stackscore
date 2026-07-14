import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe/client";

export async function getOrCreateStripeCustomerForClient(clientId: string): Promise<string> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      companyName: true,
      primaryContactEmail: true,
      primaryContactName: true,
      billingProfile: { select: { id: true, stripeCustomerId: true } },
    },
  });
  if (!client) throw new Error("Client not found");

  if (client.billingProfile?.stripeCustomerId) {
    return client.billingProfile.stripeCustomerId;
  }

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: client.primaryContactEmail,
    name: client.companyName,
    metadata: {
      clientId: client.id,
      primaryContactName: client.primaryContactName,
      source: "stackscore",
    },
  });

  await prisma.clientBillingProfile.upsert({
    where: { clientId: client.id },
    create: {
      clientId: client.id,
      billingCompanyName: client.companyName,
      billingEmail: client.primaryContactEmail,
      stripeCustomerId: customer.id,
    },
    update: {
      stripeCustomerId: customer.id,
      billingCompanyName: client.companyName,
      billingEmail: client.primaryContactEmail,
    },
  });

  return customer.id;
}

export async function findClientIdByStripeCustomerId(stripeCustomerId: string): Promise<string | null> {
  const profile = await prisma.clientBillingProfile.findUnique({
    where: { stripeCustomerId },
    select: { clientId: true },
  });
  return profile?.clientId ?? null;
}
