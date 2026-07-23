import type { AssessmentInvitationContext } from "@/lib/assessment-invitation/content";

export type AssessmentOfferAttribution = AssessmentInvitationContext & {
  source?: string;
};

export function readAssessmentOfferAttribution(
  params: Record<string, string | string[] | undefined>,
): AssessmentOfferAttribution | undefined {
  const read = (key: string): string | undefined => {
    const value = params[key];
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
    return undefined;
  };

  const attribution: AssessmentOfferAttribution = {
    prospectId: read("prospectId"),
    campaignId: read("campaignId"),
    source: read("source"),
  };

  const hasValues = Object.values(attribution).some(Boolean);
  return hasValues ? attribution : undefined;
}

export function buildAssessmentInvitationHref(
  attribution?: AssessmentOfferAttribution,
): string {
  const params = new URLSearchParams();
  if (attribution?.prospectId) params.set("prospectId", attribution.prospectId);
  if (attribution?.campaignId) params.set("campaignId", attribution.campaignId);
  const query = params.toString();
  return `/assessment-invitation${query ? `?${query}` : ""}`;
}
