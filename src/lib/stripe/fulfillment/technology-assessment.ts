import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { purchaseTrace, purchaseTraceStop } from "@/lib/purchase-trace";
import {
  activationTokenExpiresAt,
  createPlaceholderPasswordHash,
  generateActivationToken,
  normalizePurchaserEmail,
  resolveCompanyName,
  resolveContactName,
  STAFF_ROLES,
} from "@/lib/stripe/fulfillment/helpers";
import type { FulfillmentResult } from "@/lib/stripe/fulfillment/types";
import {
  isTechnologyAssessmentProduct,
  TECHNOLOGY_ASSESSMENT_PRODUCT_TYPE,
} from "@/lib/stripe/products";

const ASSESSMENT_NAME = "Technology Assessment";

function sessionProductType(session: Stripe.Checkout.Session): string | undefined {
  return session.metadata?.productType ?? session.metadata?.product;
}

function sessionPurchaserEmail(session: Stripe.Checkout.Session): string | null {
  const email = session.customer_details?.email ?? session.customer_email;
  if (!email) return null;
  return normalizePurchaserEmail(email);
}

async function recordManualReviewPurchase(
  session: Stripe.Checkout.Session,
  purchaserEmail: string,
  failureReason: string,
): Promise<FulfillmentResult> {
  const purchase = await prisma.assessmentPurchase.create({
    data: {
      stripeSessionId: session.id,
      stripeCustomerId:
        typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
      stripePaymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
      productType: TECHNOLOGY_ASSESSMENT_PRODUCT_TYPE,
      status: "manual_review",
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total ?? null,
      currency: session.currency ?? null,
      purchaserEmail,
      failureReason,
    },
  });

  purchaseTraceStop(
    "F12",
    "technology-assessment.ts → recordManualReviewPurchase return",
    "Fulfillment outcome manual_review — sendPurchaseFulfillmentEmail will NOT be called",
    {
      sessionId: session.id,
      purchaseId: purchase.id,
      failureReason,
    },
  );

  return {
    outcome: "manual_review",
    purchaseId: purchase.id,
    reason: failureReason,
  };
}

type FulfillmentContext = {
  purchaserEmail: string;
  contactName: string;
  companyName: string;
  session: Stripe.Checkout.Session;
};

async function fulfillForClientUser(
  context: FulfillmentContext,
  user: { id: string; clientId: string | null; isActive: boolean },
): Promise<FulfillmentResult> {
  if (!user.clientId) {
    throw new Error(`Client user ${user.id} is missing clientId`);
  }

  const { purchase, assessment, requiresActivation, activationToken } =
    await prisma.$transaction(async (tx) => {
      const assessment = await tx.assessment.create({
        data: {
          clientId: user.clientId!,
          assessorUserId: user.id,
          assessmentName: ASSESSMENT_NAME,
          assessmentType: "initial",
          assessmentDate: new Date(),
          status: "draft",
          scoringEngineVersion: "v2",
        },
      });

      const purchase = await tx.assessmentPurchase.create({
        data: {
          stripeSessionId: context.session.id,
          stripeCustomerId:
            typeof context.session.customer === "string"
              ? context.session.customer
              : context.session.customer?.id ?? null,
          stripePaymentIntentId:
            typeof context.session.payment_intent === "string"
              ? context.session.payment_intent
              : context.session.payment_intent?.id ?? null,
          productType: TECHNOLOGY_ASSESSMENT_PRODUCT_TYPE,
          status: "fulfilled",
          paymentStatus: context.session.payment_status,
          amountTotal: context.session.amount_total ?? null,
          currency: context.session.currency ?? null,
          purchaserEmail: context.purchaserEmail,
          clientId: user.clientId,
          userId: user.id,
          assessmentId: assessment.id,
          fulfilledAt: new Date(),
        },
      });

      let requiresActivation = false;
      let activationToken: string | undefined;

      if (!user.isActive) {
        requiresActivation = true;
        const { rawToken, tokenHash } = generateActivationToken();
        activationToken = rawToken;
        await tx.accountActivationToken.updateMany({
          where: { userId: user.id, usedAt: null },
          data: { usedAt: new Date() },
        });
        await tx.accountActivationToken.create({
          data: {
            userId: user.id,
            tokenHash,
            expiresAt: activationTokenExpiresAt(),
          },
        });
        purchaseTrace("F10a", "Activation token created for inactive existing client user", {
          userId: user.id,
          sessionId: context.session.id,
        });
      }

      return { purchase, assessment, requiresActivation, activationToken };
    });

  purchaseTrace("F10", "RETURN fulfillForClientUser — outcome fulfilled", {
    sessionId: context.session.id,
    purchaseId: purchase.id,
    assessmentId: assessment.id,
    requiresActivation,
    hasActivationToken: Boolean(activationToken),
  });

  return {
    outcome: "fulfilled",
    purchaseId: purchase.id,
    assessmentId: assessment.id,
    requiresActivation,
    activationToken,
  };
}

async function fulfillNewCustomer(context: FulfillmentContext): Promise<FulfillmentResult> {
  const passwordHash = await createPlaceholderPasswordHash();
  const { rawToken, tokenHash } = generateActivationToken();

  const { purchase, assessment } = await prisma.$transaction(async (tx) => {
    const client = await tx.client.create({
      data: {
        companyName: context.companyName,
        primaryContactName: context.contactName,
        primaryContactEmail: context.purchaserEmail,
        status: "active",
        technologyProfile: { create: {} },
      },
    });

    const user = await tx.user.create({
      data: {
        name: context.contactName,
        email: context.purchaserEmail,
        passwordHash,
        role: "client",
        isActive: false,
        invitedAt: new Date(),
        clientId: client.id,
      },
    });

    const assessment = await tx.assessment.create({
      data: {
        clientId: client.id,
        assessorUserId: user.id,
        assessmentName: ASSESSMENT_NAME,
        assessmentType: "initial",
        assessmentDate: new Date(),
        status: "draft",
        scoringEngineVersion: "v2",
      },
    });

    const purchase = await tx.assessmentPurchase.create({
      data: {
        stripeSessionId: context.session.id,
        stripeCustomerId:
          typeof context.session.customer === "string"
            ? context.session.customer
            : context.session.customer?.id ?? null,
        stripePaymentIntentId:
          typeof context.session.payment_intent === "string"
            ? context.session.payment_intent
            : context.session.payment_intent?.id ?? null,
        productType: TECHNOLOGY_ASSESSMENT_PRODUCT_TYPE,
        status: "fulfilled",
        paymentStatus: context.session.payment_status,
        amountTotal: context.session.amount_total ?? null,
        currency: context.session.currency ?? null,
        purchaserEmail: context.purchaserEmail,
        clientId: client.id,
        userId: user.id,
        assessmentId: assessment.id,
        fulfilledAt: new Date(),
      },
    });

    await tx.accountActivationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: activationTokenExpiresAt(),
      },
    });

    return { purchase, assessment };
  });

  purchaseTrace("F11", "RETURN fulfillNewCustomer — outcome fulfilled", {
    sessionId: context.session.id,
    purchaseId: purchase.id,
    assessmentId: assessment.id,
    requiresActivation: true,
    hasActivationToken: true,
  });

  return {
    outcome: "fulfilled",
    purchaseId: purchase.id,
    assessmentId: assessment.id,
    requiresActivation: true,
    activationToken: rawToken,
  };
}

/** Creates purchase, workspace, assessment, and activation token from a paid checkout session. */
export async function fulfillTechnologyAssessmentPurchase(
  session: Stripe.Checkout.Session,
): Promise<FulfillmentResult> {
  purchaseTrace("F01", "ENTER fulfillTechnologyAssessmentPurchase()", {
    sessionId: session.id,
    paymentStatus: session.payment_status,
    productType: sessionProductType(session),
    metadata: session.metadata ?? null,
    customerEmail: session.customer_details?.email ?? session.customer_email ?? null,
  });

  if (session.payment_status !== "paid") {
    purchaseTraceStop(
      "F02",
      "technology-assessment.ts → if (payment_status !== paid) return",
      `payment_status=${session.payment_status} — outcome ignored, email NOT sent`,
      { sessionId: session.id },
    );
    return { outcome: "ignored", reason: `payment_status=${session.payment_status}` };
  }

  purchaseTrace("F02", "PASS payment_status === paid", { sessionId: session.id });

  const productType = sessionProductType(session);
  if (!isTechnologyAssessmentProduct(productType)) {
    purchaseTraceStop(
      "F03",
      "technology-assessment.ts → if (!isTechnologyAssessmentProduct) return",
      `productType=${productType ?? "missing"} — outcome ignored, email NOT sent`,
      { sessionId: session.id, metadata: session.metadata ?? null },
    );
    return { outcome: "ignored", reason: `productType=${productType ?? "missing"}` };
  }

  purchaseTrace("F03", "PASS productType is technology_assessment", {
    sessionId: session.id,
    productType,
  });

  const purchaserEmail = sessionPurchaserEmail(session);
  if (!purchaserEmail) {
    throw new Error(`Checkout session ${session.id} is missing purchaser email`);
  }

  purchaseTrace("F04", "PASS purchaser email resolved", {
    sessionId: session.id,
    purchaserEmail,
  });

  const existingPurchase = await prisma.assessmentPurchase.findUnique({
    where: { stripeSessionId: session.id },
  });

  if (existingPurchase) {
    purchaseTraceStop(
      "F05",
      "technology-assessment.ts → if (existingPurchase) return",
      "outcome already_fulfilled — sendPurchaseFulfillmentEmail will NOT be called on this webhook delivery",
      {
        sessionId: session.id,
        purchaseId: existingPurchase.id,
        purchaseStatus: existingPurchase.status,
        purchaserEmail: existingPurchase.purchaserEmail,
      },
    );
    return {
      outcome: "already_fulfilled",
      purchaseId: existingPurchase.id,
      assessmentId: existingPurchase.assessmentId ?? undefined,
    };
  }

  purchaseTrace("F05", "PASS no existing purchase for stripeSessionId", {
    sessionId: session.id,
  });

  const existingUser = await prisma.user.findUnique({
    where: { email: purchaserEmail },
    select: { id: true, role: true, clientId: true, isActive: true },
  });

  purchaseTrace("F06", "Existing user lookup complete", {
    sessionId: session.id,
    purchaserEmail,
    existingUser: existingUser
      ? {
          id: existingUser.id,
          role: existingUser.role,
          clientId: existingUser.clientId,
          isActive: existingUser.isActive,
        }
      : null,
  });

  if (existingUser && STAFF_ROLES.includes(existingUser.role as (typeof STAFF_ROLES)[number])) {
    purchaseTrace("F07", "Branch: staff email collision → manual_review", {
      sessionId: session.id,
      userId: existingUser.id,
      role: existingUser.role,
    });
    return recordManualReviewPurchase(
      session,
      purchaserEmail,
      "Purchaser email belongs to an existing staff account",
    );
  }

  const context: FulfillmentContext = {
    purchaserEmail,
    contactName: resolveContactName(session.customer_details?.name, purchaserEmail),
    companyName: resolveCompanyName(session.customer_details?.name),
    session,
  };

  if (existingUser?.role === "client" && existingUser.clientId) {
    purchaseTrace("F08", "Branch: existing client user → fulfillForClientUser", {
      sessionId: session.id,
      userId: existingUser.id,
      isActive: existingUser.isActive,
    });
    return fulfillForClientUser(context, existingUser);
  }

  if (existingUser) {
    purchaseTrace("F09", "Branch: unsupported existing user → manual_review", {
      sessionId: session.id,
      userId: existingUser.id,
      role: existingUser.role,
    });
    return recordManualReviewPurchase(
      session,
      purchaserEmail,
      "Purchaser email belongs to an unsupported existing account",
    );
  }

  purchaseTrace("F09", "Branch: new customer → fulfillNewCustomer", {
    sessionId: session.id,
    purchaserEmail,
  });
  return fulfillNewCustomer(context);
}

async function createActivationTokenForUser(userId: string): Promise<string> {
  const { rawToken, tokenHash } = generateActivationToken();

  await prisma.accountActivationToken.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  });

  await prisma.accountActivationToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: activationTokenExpiresAt(),
    },
  });

  return rawToken;
}

export { createActivationTokenForUser };
