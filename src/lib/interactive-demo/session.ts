const RETURN_TO_KEY = "stackscore-demo-return-to";
const WELCOME_DISMISSED_KEY = "stackscore-demo-welcome-dismissed";
const CONVERSION_CTA_DISMISSED_KEY = "stackscore-demo-conversion-cta-dismissed";
const STARTED_KEY = "stackscore-demo-started";

const SAFE_INTERNAL_PATH = /^\/(?!\/)[A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=%]*$/;

export function isSafeInternalPath(path: string | null | undefined): path is string {
  if (!path) return false;
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.startsWith("/demo")) return false;
  return SAFE_INTERNAL_PATH.test(path);
}

export function persistDemoReturnTo(path: string | null | undefined) {
  if (typeof window === "undefined") return;
  if (!isSafeInternalPath(path)) return;
  try {
    sessionStorage.setItem(RETURN_TO_KEY, path);
  } catch {
    // Ignore storage failures (private mode, quota, etc.)
  }
}

export function readDemoReturnTo(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = sessionStorage.getItem(RETURN_TO_KEY);
    return isSafeInternalPath(value) ? value : null;
  } catch {
    return null;
  }
}

export function clearDemoReturnTo() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(RETURN_TO_KEY);
  } catch {
    // ignore
  }
}

export function wasDemoWelcomeDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(WELCOME_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissDemoWelcomeForSession() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(WELCOME_DISMISSED_KEY, "1");
  } catch {
    // ignore
  }
}

export function wasDemoConversionCtaDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(CONVERSION_CTA_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissDemoConversionCtaForSession() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CONVERSION_CTA_DISMISSED_KEY, "1");
  } catch {
    // ignore
  }
}

/** Returns true the first time demo start is recorded in this session. */
export function markDemoStartedForSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (sessionStorage.getItem(STARTED_KEY) === "1") return false;
    sessionStorage.setItem(STARTED_KEY, "1");
    return true;
  } catch {
    return true;
  }
}
