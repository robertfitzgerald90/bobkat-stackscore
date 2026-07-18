import {
  CANONICAL_APP_ORIGIN,
  isLegacyAppHost,
  isLocalDevHost,
} from "@/lib/url/base-url";

type LegacyRedirectRequest = {
  headers: { get(name: string): string | null };
  nextUrl: { pathname: string; search: string };
};

/**
 * Returns a permanent redirect target when the request hits the legacy StackScore host.
 * API routes are excluded so webhooks can continue during migration until dashboards are updated.
 */
export function resolveLegacyDomainRedirect(request: LegacyRedirectRequest): URL | null {
  const host = request.headers.get("host") ?? "";

  if (isLocalDevHost(host) || !isLegacyAppHost(host)) {
    return null;
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return null;
  }

  return new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, CANONICAL_APP_ORIGIN);
}
