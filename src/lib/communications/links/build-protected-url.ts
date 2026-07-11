import { getAppUrl } from "@/lib/stripe/app-url";

export function buildAppPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized;
}

export function buildPublicAppUrl(path: string): string {
  return `${getAppUrl()}${buildAppPath(path)}`;
}

/** Wraps a protected in-app path with login redirect preservation. */
export function buildProtectedAppUrl(path: string): string {
  const callbackPath = buildAppPath(path);
  const params = new URLSearchParams({ callbackUrl: callbackPath });
  return `${getAppUrl()}/login?${params.toString()}`;
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
