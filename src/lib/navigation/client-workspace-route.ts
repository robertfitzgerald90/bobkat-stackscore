const NON_CLIENT_WORKSPACE_PREFIXES = ["/clients/new"] as const;

/** Staff/consultant client workspace routes (`/clients/:id/...`). */
export function isClientWorkspaceRoute(pathname: string): boolean {
  if (!/^\/clients\/[^/]+(\/.*)?$/.test(pathname)) return false;
  return !NON_CLIENT_WORKSPACE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/** Routes that use the unified sticky client application shell (toolbar + context + nav). */
export function isStaffClientWorkspaceRoute(pathname: string, role: string): boolean {
  if (role === "client") return false;
  return isClientWorkspaceRoute(pathname);
}
