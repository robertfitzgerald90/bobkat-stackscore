import { createHmac } from "node:crypto";
import type { RateLimitScope } from "./config";

/**
 * HMAC-SHA256 of scope + identifier. Never store raw emails/tokens/IPs in bucketKey.
 * Uses AUTH_SECRET (required for Auth.js) so keys are not reverse-engineerable offline
 * without the secret.
 */
export function hashRateLimitIdentifier(scope: RateLimitScope, identifier: string): string {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) {
    throw new Error("AUTH_SECRET is required for authentication rate limiting");
  }

  const normalized = identifier.trim().toLowerCase();
  return createHmac("sha256", secret).update(`${scope}:${normalized}`).digest("hex");
}

/**
 * First IP token from a possibly comma-separated forwarding header.
 */
export function firstForwardedIp(headerValue: string | null): string | null {
  if (!headerValue) return null;
  const first = headerValue.split(",")[0]?.trim();
  return first || null;
}

/**
 * Client IP for rate limiting on Vercel-hosted deployments.
 *
 * Per Vercel request-header docs (https://vercel.com/docs/headers/request-headers):
 * - On direct Vercel traffic, `x-forwarded-for` / `x-real-ip` are set to the client IP
 *   and are overwritten so clients cannot spoof them.
 * - `x-vercel-forwarded-for` matches that client IP and is preferred when an external
 *   reverse proxy may overwrite `x-forwarded-for` (without Verified Proxy, Vercel may
 *   still overwrite XFF; prefer the Vercel-owned header when present).
 *
 * Local / non-Vercel environments: these headers are client-controlled; IP buckets
 * are best-effort only.
 */
export function resolveClientIp(request: Request): string {
  const vercelForwarded = firstForwardedIp(request.headers.get("x-vercel-forwarded-for"));
  if (vercelForwarded) return vercelForwarded;

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwarded = firstForwardedIp(request.headers.get("x-forwarded-for"));
  if (forwarded) return forwarded;

  return "unknown";
}

export function normalizeEmailIdentifier(email: string): string {
  return email.trim().toLowerCase();
}
