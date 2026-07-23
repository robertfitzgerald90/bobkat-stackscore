export function logCommercialInsightsFailure(
  stage: string,
  error: unknown,
  context?: Record<string, unknown>,
): void {
  console.error("[commercial-insights]", {
    stage,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  });
}
