import { TECHNOLOGY_ASSESSMENT_PRODUCT_TYPE } from "@/lib/stripe/products";

/** Stripe Checkout metadata `service` value for Technology Maturity Assessment purchases. */
export const ASSESSMENT_CHECKOUT_SERVICE = "technology_maturity_assessment";

export const ASSESSMENT_CHECKOUT_PLATFORM = "stackscore";

export const ASSESSMENT_CHECKOUT_SOURCE_DEFAULT = "stackscore_assessment_offer";

export const ASSESSMENT_CHECKOUT_SOURCE_BOBKAT = "bobkat_it_website";

export type AssessmentCheckoutMetadataInput = {
  source?: string;
  prospectId?: string;
  campaignId?: string;
  leadId?: string;
  organizationId?: string;
  invitationId?: string;
};

export function resolveAssessmentCheckoutSource(raw: unknown): string {
  if (typeof raw !== "string") return ASSESSMENT_CHECKOUT_SOURCE_DEFAULT;
  const normalized = raw.trim();
  if (!normalized) return ASSESSMENT_CHECKOUT_SOURCE_DEFAULT;
  if (normalized === ASSESSMENT_CHECKOUT_SOURCE_BOBKAT) return ASSESSMENT_CHECKOUT_SOURCE_BOBKAT;
  return normalized;
}

export function buildAssessmentCheckoutMetadata(
  input: AssessmentCheckoutMetadataInput = {},
): Record<string, string> {
  const metadata: Record<string, string> = {
    productType: TECHNOLOGY_ASSESSMENT_PRODUCT_TYPE,
    service: ASSESSMENT_CHECKOUT_SERVICE,
    platform: ASSESSMENT_CHECKOUT_PLATFORM,
    source: resolveAssessmentCheckoutSource(input.source),
  };

  if (input.prospectId) metadata.prospectId = input.prospectId;
  if (input.campaignId) metadata.campaignId = input.campaignId;
  if (input.leadId) metadata.leadId = input.leadId;
  if (input.organizationId) metadata.organizationId = input.organizationId;
  if (input.invitationId) metadata.invitationId = input.invitationId;

  return metadata;
}
