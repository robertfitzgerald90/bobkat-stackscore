import { NextResponse } from "next/server";
import { getSessionUserWithClient, isStaffRole, requireClientWorkspaceAccess } from "@/lib/api/access";
import { unauthorized } from "@/lib/api/helpers";
import { recordBillingAudit } from "@/lib/billing/audit";
import { prisma } from "@/lib/db";
import { getAppUrl } from "@/lib/stripe/app-url";
import { getStripe } from "@/lib/stripe/client";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const { id: clientId } = await context.params;
  const user = await getSessionUserWithClient();
  if (!user) return unauthorized();

  const denied = await requireClientWorkspaceAccess(user, clientId);
  if (denied) return denied;

  const canManageStripePortal =
    isStaffRole(user.role) || (user.role === "client" && user.clientId === clientId);
  if (!canManageStripePortal) {
    return NextResponse.json({ error: "You do not have access to manage billing." }, { status: 403 });
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      billingProfile: { select: { stripeCustomerId: true } },
      subscriptions: {
        where: { provider: "stripe" },
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: { providerCustomerId: true },
      },
    },
  });
  if (!client) {
    return NextResponse.json({ error: "Client not found." }, { status: 404 });
  }

  const stripeCustomerId =
    client.billingProfile?.stripeCustomerId ?? client.subscriptions[0]?.providerCustomerId;
  if (!stripeCustomerId) {
    return NextResponse.json(
      { error: "No Stripe customer is available for this workspace." },
      { status: 400 },
    );
  }

  const stripe = getStripe();
  const appUrl = getAppUrl();
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${appUrl}/clients/${clientId}/billing`,
  });

  await recordBillingAudit({
    clientId,
    actorUserId: user.id,
    action: "invoice_viewed",
    metadata: {
      event: "billing_portal_opened",
    },
  });

  return NextResponse.json({ url: portalSession.url });
}
