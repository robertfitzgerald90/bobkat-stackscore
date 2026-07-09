type TracePayload = Record<string, unknown>;

/** Numbered purchase→email trace. Search Vercel logs for `[purchase-trace]`. */
export function purchaseTrace(step: string, message: string, payload?: TracePayload): void {
  console.info(`[purchase-trace] ${step} ${message}`, payload ?? {});
}

export function purchaseTraceStop(
  step: string,
  location: string,
  reason: string,
  payload?: TracePayload,
): void {
  console.warn(`[purchase-trace] ${step} STOP @ ${location} — ${reason}`, payload ?? {});
}

export function purchaseTraceError(
  step: string,
  location: string,
  error: unknown,
  payload?: TracePayload,
): void {
  console.error(`[purchase-trace] ${step} ERROR @ ${location}`, {
    ...(payload ?? {}),
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    error,
  });
}
