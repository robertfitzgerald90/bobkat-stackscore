import { buildAppPath, buildAppUrl, getBaseUrl } from "@/lib/url/base-url";

export { buildAppPath };

export function buildPublicAppUrl(path: string): string {
  return buildAppUrl(path);
}

/** Wraps a protected in-app path with login redirect preservation. */
export function buildProtectedAppUrl(path: string): string {
  const callbackPath = buildAppPath(path);
  const params = new URLSearchParams({ callbackUrl: callbackPath });
  return `${getBaseUrl()}/login?${params.toString()}`;
}

export function buildInvitationLandingUrl(input?: {
  prospectId?: string;
  campaignId?: string;
  recipientFirstName?: string;
  invitedByName?: string;
}): string {
  const params = new URLSearchParams();
  if (input?.prospectId) params.set("prospectId", input.prospectId);
  if (input?.campaignId) params.set("campaignId", input.campaignId);
  if (input?.recipientFirstName) params.set("recipientFirstName", input.recipientFirstName);
  if (input?.invitedByName) params.set("invitedByName", input.invitedByName);
  const query = params.toString();
  return buildPublicAppUrl(`/assessment-invitation${query ? `?${query}` : ""}`);
}
