/** Canonical client landing route (Technology Profile per DOC-113). */
export function clientTechnologyProfilePath(clientId: string) {
  return `/clients/${clientId}/technology-profile`;
}

/** Client workspace with Immediate Focus in view (DOC-160). */
export function clientImmediateFocusPath(clientId: string) {
  return `${clientTechnologyProfilePath(clientId)}#immediate-focus`;
}

export function clientRecommendationsPath(clientId: string) {
  return `/clients/${clientId}/recommendations`;
}
