export function buildTechnologySnapshotUrl(input?: {
  prospectId?: string;
  campaignId?: string;
}): string {
  const params = new URLSearchParams();
  if (input?.prospectId) params.set("prospectId", input.prospectId);
  if (input?.campaignId) params.set("campaignId", input.campaignId);
  const query = params.toString();
  return `/technology-snapshot${query ? `?${query}` : ""}`;
}
