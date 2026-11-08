type TracePayload = Record<string, unknown>;

const REDACTED = "[redacted]";

const REDACT_VALUE_KEYS = new Set([
  "html",
  "text",
  "textpreview",
  "body",
  "activationurl",
  "activationtoken",
  "rawtoken",
  "token",
  "password",
  "passwordhash",
  "secret",
  "authorization",
  "resendapikey",
  "apikey",
]);

const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const SENSITIVE_QUERY_PATTERN =
  /([?&#](?:token|activation|reset|password|invite|invitation|key|secret)=)[^&#\s"']+/gi;

function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return "[redacted-email]";
  return `${email[0]}***${email.slice(at)}`;
}

function sanitizeTraceString(value: string): string {
  return value
    .replace(SENSITIVE_QUERY_PATTERN, "$1[redacted]")
    .replace(EMAIL_PATTERN, (match) => maskEmail(match));
}

function sanitizeTraceValue(key: string, value: unknown): unknown {
  const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (REDACT_VALUE_KEYS.has(normalized)) return REDACTED;
  if (value instanceof Error) {
    return {
      name: value.name,
      message: sanitizeTraceString(value.message),
    };
  }
  if (typeof value === "string") return sanitizeTraceString(value);
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeTraceValue(key, item));
  }
  if (value && typeof value === "object") {
    return sanitizeTracePayload(value as TracePayload);
  }
  return value;
}

function sanitizeTracePayload(payload: TracePayload): TracePayload {
  const sanitized: TracePayload = {};
  for (const [key, value] of Object.entries(payload)) {
    sanitized[key] = sanitizeTraceValue(key, value);
  }
  return sanitized;
}

function errorDiagnostic(error: unknown): { errorName: string; message: string } {
  if (error instanceof Error) {
    return { errorName: error.name, message: sanitizeTraceString(error.message) };
  }
  return { errorName: "Error", message: sanitizeTraceString(String(error)) };
}

/** Numbered purchase→email trace. Search Vercel logs for `[purchase-trace]`. */
export function purchaseTrace(step: string, message: string, payload?: TracePayload): void {
  console.info(
    `[purchase-trace] ${step} ${message}`,
    sanitizeTracePayload(payload ?? {}),
  );
}

export function purchaseTraceStop(
  step: string,
  location: string,
  reason: string,
  payload?: TracePayload,
): void {
  console.warn(
    `[purchase-trace] ${step} STOP @ ${location} — ${sanitizeTraceString(reason)}`,
    sanitizeTracePayload(payload ?? {}),
  );
}

export function purchaseTraceError(
  step: string,
  location: string,
  error: unknown,
  payload?: TracePayload,
): void {
  console.error(`[purchase-trace] ${step} ERROR @ ${location}`, {
    ...sanitizeTracePayload(payload ?? {}),
    ...errorDiagnostic(error),
  });
}
