const SENSITIVE_QUERY_KEYS = new Set([
  "token",
  "activation",
  "reset",
  "password",
  "invite",
  "invitation",
  "session",
  "key",
  "secret",
]);

export function maskSensitiveUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    for (const key of [...parsed.searchParams.keys()]) {
      if (SENSITIVE_QUERY_KEYS.has(key.toLowerCase())) {
        parsed.searchParams.set(key, "[redacted]");
      }
    }
    return parsed.toString();
  } catch {
    return url.replace(/token=[^&]+/gi, "token=[redacted]");
  }
}

export function extractLinkLabel(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    if (parsed.pathname.includes("activate")) return "Activation link";
    if (parsed.pathname.includes("reset")) return "Password reset link";
    if (parsed.pathname.includes("assessment")) return "Assessment link";
    if (parsed.pathname.includes("roadmap")) return "Roadmap link";
    if (parsed.pathname.includes("proposal")) return "Proposal link";
    if (parsed.pathname.includes("project")) return "Project link";
    return parsed.pathname.split("/").filter(Boolean).pop() ?? "Link";
  } catch {
    return "Link";
  }
}
