const TEST_DOMAINS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "mailinator.com",
  "guerrillamail.com",
]);

/**
 * Staff accounts, demo-seed addresses, and obvious test inboxes.
 * Does not treat every @bobkatit.com address as internal.
 */
export function isInternalOrTestEmail(
  email: string | null | undefined,
  staffEmails: ReadonlySet<string>,
): boolean {
  const normalized = email?.trim().toLowerCase() ?? "";
  if (!normalized || !normalized.includes("@")) return false;
  if (staffEmails.has(normalized)) return true;

  const at = normalized.lastIndexOf("@");
  const local = normalized.slice(0, at);
  const domain = normalized.slice(at + 1);
  if (!local || !domain) return false;
  if (TEST_DOMAINS.has(domain)) return true;
  if (domain === "bobkatit.com" && (local.endsWith(".demo") || local.includes("bobbytest"))) {
    return true;
  }
  if (local === "test" || local.startsWith("test+") || local.includes("+test")) return true;
  return /(^|[.+_-])test([.+_-]|$)/i.test(local);
}

export function isStripeTestSession(sessionId: string | null | undefined): boolean {
  return Boolean(sessionId?.startsWith("cs_test_"));
}
