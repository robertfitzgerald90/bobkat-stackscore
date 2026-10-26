/**
 * @deprecated Prefer durable `enforceWebsiteLeadsIpLimits` from `@/lib/auth/rate-limit`
 * (SS-SEC-007 / SEC-001-M07). Kept for legacy unit tests of key resolution only.
 */
export function resolveRateLimitKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}
