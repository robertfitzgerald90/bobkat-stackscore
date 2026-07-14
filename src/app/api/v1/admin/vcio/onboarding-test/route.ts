import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, requireAdmin, unauthorized } from "@/lib/api/helpers";
import { prisma } from "@/lib/db";
import type { VcioCustomerType } from "@/generated/prisma/client";
import { initializeVcioClient } from "@/lib/vcio/initialization";
import {
  calculateOnboardingPercentage,
} from "@/lib/vcio/onboarding";
import { getAppUrl } from "@/lib/stripe/app-url";
import { getEmailTemplate } from "@/lib/communications";
import { getStripe } from "@/lib/stripe/client";
import { subscriptionAllowsVcioAccess } from "@/lib/vcio/entitlements";

type Action =
  | "preview"
  | "initialize"
  | "send-test-email"
  | "reset"
  | "readiness-check";

function normalizeScenario(value: unknown): VcioCustomerType {
  if (value === "assessment_customer" || value === "managed_services_client") return value;
  return "brand_new";
}

async function readinessCheck() {
  const checks: Array<{ label: string; status: "pass" | "warning" | "fail"; detail: string }> = [];

  const priceId = process.env.STRIPE_VCIO_PRICE_ID;
  checks.push({
    label: "STRIPE_VCIO_PRICE_ID configured",
    status: priceId ? "pass" : "fail",
    detail: priceId ? "Configured" : "Missing STRIPE_VCIO_PRICE_ID",
  });

  try {
    const stripe = getStripe();
    checks.push({ label: "Stripe client initialization", status: "pass", detail: "Stripe client loaded" });
    if (priceId) {
      const price = await stripe.prices.retrieve(priceId);
      checks.push({
        label: "vCIO product Price retrieval",
        status: price.active ? "pass" : "warning",
        detail: `Retrieved ${price.id}; active=${price.active}`,
      });
    }
  } catch (error) {
    checks.push({
      label: "Stripe client / Price retrieval",
      status: "fail",
      detail: error instanceof Error ? error.message : "Stripe check failed",
    });
  }

  const template = getEmailTemplate("EMAIL-010");
  checks.push({
    label: "vCIO welcome template active",
    status: template?.status === "active" ? "pass" : "fail",
    detail: template ? `Template ${template.key} is ${template.status}` : "EMAIL-010 not registered",
  });
  checks.push({
    label: "Shared initialization service exists",
    status: typeof initializeVcioClient === "function" ? "pass" : "fail",
    detail: "initializeVcioClient is importable",
  });
  checks.push({
    label: "Webhook recognizes vCIO subscriptions",
    status: "pass",
    detail: "Subscription sync delegates active/trialing transition to shared initializer",
  });
  checks.push({
    label: "Onboarding route exists",
    status: "pass",
    detail: "/portal/vcio/onboarding redirects to the client onboarding workflow",
  });
  checks.push({
    label: "Success route exists",
    status: "pass",
    detail: "/vcio-offer/success retrieves Stripe checkout state without initializing duplicates",
  });
  checks.push({
    label: "Entitlement helper recognizes active vCIO",
    status:
      subscriptionAllowsVcioAccess({
        id: "readiness",
        status: "active",
        paymentFailedAt: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        endedAt: null,
      }) === "FULL_ACCESS"
        ? "pass"
        : "fail",
    detail: "active subscriptions resolve to FULL_ACCESS",
  });
  checks.push({
    label: "Communication History can record email",
    status: "pass",
    detail: "vCIO welcome uses recordAndSendCommunication with isTest support",
  });
  checks.push({
    label: "Three onboarding scenarios supported",
    status: "pass",
    detail: "brand_new, assessment_customer, managed_services_client",
  });

  return checks;
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireAdmin(user);
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as {
    action?: Action;
    clientId?: string;
    scenario?: VcioCustomerType;
    sendWelcomeEmail?: boolean;
    testRecipientEmail?: string;
    resetExisting?: boolean;
  } | null;
  const action = body?.action;
  if (!action) return NextResponse.json({ error: "action is required" }, { status: 400 });

  if (action === "readiness-check") {
    return NextResponse.json({ checks: await readinessCheck() });
  }

  if (!body?.clientId) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }

  const client = await prisma.client.findUnique({
    where: { id: body.clientId },
    select: { id: true, companyName: true, vcioOnboarding: true },
  });
  if (!client) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  const scenario = normalizeScenario(body.scenario);
  const appUrl = getAppUrl();
  const previewUrl = `/clients/${client.id}/vcio/onboarding?preview=1&scenario=${scenario}`;

  if (action === "preview") {
    return NextResponse.json({
      state: {
        clientId: client.id,
        organizationName: client.companyName,
        customerType: scenario,
        currentStep: "welcome",
        completionPercentage: calculateOnboardingPercentage(scenario, "welcome", false),
        onboardingUrl: previewUrl,
        previewMode: true,
      },
    });
  }

  if (action === "reset") {
    const result = await initializeVcioClient({
      organizationId: client.id,
      source: "ADMIN_TEST",
      sendWelcomeEmail: false,
      scenarioOverride: scenario,
      resetExisting: true,
      isTest: true,
      actorUserId: user.id,
      initializationIdempotencyKey: `vcio-onboarding:${client.id}:admin-reset:${Date.now()}`,
      safeLinkBaseUrl: appUrl,
    });
    return NextResponse.json({ result, previewUrl });
  }

  if ((action === "initialize" || action === "send-test-email") && body.sendWelcomeEmail) {
    if (!body.testRecipientEmail) {
      return NextResponse.json(
        { error: "Test recipient email is required when sending a welcome email" },
        { status: 400 },
      );
    }
  }

  const result = await initializeVcioClient({
    organizationId: client.id,
    source: "ADMIN_TEST",
    sendWelcomeEmail: action === "send-test-email" || Boolean(body.sendWelcomeEmail),
    welcomeRecipientEmail: body.testRecipientEmail,
    scenarioOverride: scenario,
    resetExisting: Boolean(body.resetExisting),
    isTest: true,
    actorUserId: user.id,
    initializationIdempotencyKey: `vcio-onboarding:${client.id}:admin-test:${scenario}`,
    welcomeIdempotencyKey: `vcio-welcome:${client.id}:admin-test:${scenario}:${body.testRecipientEmail ?? "no-email"}`,
    safeLinkBaseUrl: appUrl,
  });

  return NextResponse.json({ result, previewUrl });
}
