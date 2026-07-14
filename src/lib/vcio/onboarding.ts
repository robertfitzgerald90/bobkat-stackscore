import type { VcioCustomerType } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

export const VCIO_ONBOARDING_STEPS = ["welcome", "business", "goals", "strategy", "complete"] as const;
export type VcioOnboardingStep = (typeof VCIO_ONBOARDING_STEPS)[number];

export async function detectVcioCustomerType(clientId: string): Promise<VcioCustomerType> {
  const [completedAssessment, managedService] = await Promise.all([
    prisma.assessment.findFirst({
      where: { clientId, status: "completed" },
      select: { id: true },
    }),
    prisma.recurringService.findFirst({
      where: {
        clientId,
        status: { in: ["active", "pending_activation", "cancellation_scheduled"] },
        OR: [
          { serviceName: { contains: "managed", mode: "insensitive" } },
          { serviceName: { contains: "msp", mode: "insensitive" } },
          { description: { contains: "managed", mode: "insensitive" } },
        ],
      },
      select: { id: true },
    }),
  ]);

  if (managedService) return "managed_services_client";
  if (completedAssessment) return "assessment_customer";
  return "brand_new";
}

export function getOnboardingStepsForCustomerType(customerType: VcioCustomerType) {
  if (customerType === "managed_services_client") {
    return ["welcome", "goals", "strategy", "complete"] as const;
  }
  if (customerType === "assessment_customer") {
    return ["welcome", "goals", "strategy", "complete"] as const;
  }
  return VCIO_ONBOARDING_STEPS;
}

export function calculateOnboardingPercentage(
  customerType: VcioCustomerType,
  currentStep: string,
  complete: boolean,
) {
  if (complete) return 100;
  const steps = getOnboardingStepsForCustomerType(customerType);
  const index = Math.max(0, steps.findIndex((step) => step === currentStep));
  return Math.round((index / Math.max(1, steps.length - 1)) * 100);
}

export function nextOnboardingStep(customerType: VcioCustomerType, currentStep: string) {
  const steps = getOnboardingStepsForCustomerType(customerType);
  const index = steps.findIndex((step) => step === currentStep);
  return steps[Math.min(index + 1, steps.length - 1)] ?? "complete";
}

export function getClientSuccessDashboardPath(clientId: string) {
  return `/clients/${clientId}/vcio`;
}
