import { timingSafeEqual } from "node:crypto";

export const WEBSITE_LEADS_SECRET_HEADER = "x-website-leads-secret";

export function requireWebsiteLeadsApiSecret(request: Request): boolean {
  const configured = process.env.WEBSITE_LEADS_API_SECRET?.trim();
  if (!configured) return false;

  const bearer = request.headers.get("authorization");
  const customHeader = request.headers.get(WEBSITE_LEADS_SECRET_HEADER);
  const provided =
    bearer?.startsWith("Bearer ") ? bearer.slice("Bearer ".length).trim() : customHeader?.trim();

  if (!provided) return false;

  return safeCompareSecrets(provided, configured);
}

function safeCompareSecrets(provided: string, expected: string): boolean {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(providedBuffer, expectedBuffer);
}
