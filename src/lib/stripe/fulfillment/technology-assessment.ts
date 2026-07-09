import type Stripe from "stripe";
import { prisma } from "@/lib/db";
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

  console.warn("[stripe/fulfillment] Manual review required", {
    purchaseId: purchase.id,
    sessionId: session.id,
    purchaserEmail,
    failureReason,
  });

  return {
    outcome: "manual_review",
    purchaseId: purchase.id,
    reason: failureReason,
  };
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
        console.info("[stripe/fulfillment] Activation token created for inactive client user", {
          userId: user.id,
          sessionId: context.session.id,
        });
      }

      return { purchase, assessment, requiresActivation, activationToken };
    });

  console.info("[stripe/fulfillment] Purchase created for existing client user", {
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

  console.info("[stripe/fulfillment] Purchase created for new customer", {
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
  console.info("[stripe/fulfillment] Entering fulfillment", {
    sessionId: session.id,
    paymentStatus: session.payment_status,
    productType: sessionProductType(session),
    customerEmail: session.customer_details?.email ?? session.customer_email ?? null,
  });

  if (session.payment_status !== "paid") {
    console.info("[stripe/fulfillment] Skipped — payment not paid", {
      sessionId: session.id,
      paymentStatus: session.payment_status,
    });
    return { outcome: "ignored", reason: `payment_status=${session.payment_status}` };
  }

  const productType = sessionProductType(session);
  if (!isTechnologyAssessmentProduct(productType)) {
    console.info("[stripe/fulfillment] Skipped — unexpected product type", {
      sessionId: session.id,
      productType: productType ?? "missing",
    });
    return { outcome: "ignored", reason: `productType=${productType ?? "missing"}` };
  }

  const purchaserEmail = sessionPurchaserEmail(session);
  if (!purchaserEmail) {
    throw new Error(`Checkout session ${session.id} is missing purchaser email`);
  }

  const existingPurchase = await prisma.assessmentPurchase.findUnique({
    where: { stripeSessionId: session.id },
  });

  if (existingPurchase) {
    console.info("[stripe/fulfillment] Duplicate webhook — purchase already exists, email will be skipped", {
      sessionId: session.id,
      purchaseId: existingPurchase.id,
      purchaseStatus: existingPurchase.status,
      purchaserEmail: existingPurchase.purchaserEmail,
    });
    return {
      outcome: "already_fulfilled",
      purchaseId: existingPurchase.id,
      assessmentId: existingPurchase.assessmentId ?? undefined,
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: purchaserEmail },
    select: { id: true, role: true, clientId: true, isActive: true },
  });

  if (existingUser && STAFF_ROLES.includes(existingUser.role as (typeof STAFF_ROLES)[number])) {
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
    console.info("[stripe/fulfillment] Repeat purchase for existing client user", {
      sessionId: session.id,
      userId: existingUser.id,
      isActive: existingUser.isActive,
      willRequireActivation: !existingUser.isActive,
    });
    return fulfillForClientUser(context, existingUser);
  }

  if (existingUser) {
    return recordManualReviewPurchase(
      session,
      purchaserEmail,
      "Purchaser email belongs to an unsupported existing account",
    );
  }

  console.info("[stripe/fulfillment] Creating new customer workspace", {
    sessionId: session.id,
    purchaserEmail,
  });
  return fulfillNewCustomer(context);
}

export { createActivationTokenForUser };
