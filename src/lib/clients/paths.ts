/** Canonical client landing route (Technology Profile per DOC-113). */
export function clientTechnologyProfilePath(clientId: string) {
  return `/clients/${clientId}/technology-profile`;
}

export function clientRecommendationsPath(clientId: string) {
  return `/clients/${clientId}/recommendations`;
}
