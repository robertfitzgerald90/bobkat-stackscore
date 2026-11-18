import type { AnalyticsProperty } from "@/lib/admin-analytics/types";

export class ProviderRequestError extends Error {}

export type ConnectionGate =
  | { status: "not_connected"; message: string }
  | { status: "unavailable"; message: string }
  | { status: "ready"; message: string };

type ServiceAccount = {
  client_email: string;
  private_key: string;
};

function readServiceAccount(): { account: ServiceAccount } | { error: string } | { missing: true } {
  const raw = process.env.GA4_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return { missing: true };

  try {
    const json = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
    const parsed = JSON.parse(json) as Partial<ServiceAccount>;
    if (!parsed.client_email || !parsed.private_key?.includes("PRIVATE KEY")) {
      return { error: "The GA4 service account JSON is missing the client email or private key." };
    }
    return { account: { client_email: parsed.client_email, private_key: parsed.private_key } };
  } catch {
    return { error: "The GA4 service account JSON could not be read." };
  }
}

export function propertyIdFor(site: AnalyticsProperty): string | null {
  const raw =
    site === "bobkat"
      ? process.env.GA4_BOBKAT_PROPERTY_ID
      : process.env.GA4_STACKSCORE_PROPERTY_ID;
  const id = raw?.trim().replace(/^properties\//, "") ?? "";
  return /^\d+$/.test(id) ? id : null;
}

export function ga4Gate(site: AnalyticsProperty): ConnectionGate {
  const account = readServiceAccount();
  const propertyId = propertyIdFor(site);
  const propertyName = site === "bobkat" ? "GA4_BOBKAT_PROPERTY_ID" : "GA4_STACKSCORE_PROPERTY_ID";

  if ("missing" in account && !propertyId) {
    return {
      status: "not_connected",
      message: `Set GA4_SERVICE_ACCOUNT_JSON and ${propertyName} on the server.`,
    };
  }
  if ("missing" in account) {
    return { status: "not_connected", message: "Set GA4_SERVICE_ACCOUNT_JSON on the server." };
  }
  if ("error" in account) {
    return { status: "unavailable", message: account.error };
  }
  if (!propertyId) {
    return { status: "not_connected", message: `Set ${propertyName} to the numeric GA4 property id.` };
  }
  return { status: "ready", message: "GA4 Data API credentials are configured." };
}

export function readGa4ServiceAccount(): ServiceAccount | null {
  const account = readServiceAccount();
  if ("account" in account) return account.account;
  return null;
}

export function vercelProjectId(site: AnalyticsProperty): string | null {
  const raw =
    site === "bobkat"
      ? process.env.VERCEL_BOBKAT_PROJECT_ID
      : process.env.VERCEL_STACKSCORE_PROJECT_ID;
  const id = raw?.trim() ?? "";
  return id.length > 0 ? id : null;
}

export function vercelGate(site: AnalyticsProperty): ConnectionGate {
  const token = process.env.VERCEL_WEB_ANALYTICS_TOKEN?.trim();
  const projectId = vercelProjectId(site);
  const projectName =
    site === "bobkat" ? "VERCEL_BOBKAT_PROJECT_ID" : "VERCEL_STACKSCORE_PROJECT_ID";

  if (!token && !projectId) {
    return {
      status: "not_connected",
      message: `Set VERCEL_WEB_ANALYTICS_TOKEN and ${projectName} on the server.`,
    };
  }
  if (!token) {
    return { status: "not_connected", message: "Set VERCEL_WEB_ANALYTICS_TOKEN on the server." };
  }
  if (!projectId) {
    return { status: "not_connected", message: `Set ${projectName} to the Vercel project id.` };
  }
  return { status: "ready", message: "Vercel Web Analytics credentials are configured." };
}

export function selectedProperties(site: "all" | AnalyticsProperty): AnalyticsProperty[] {
  if (site === "all") return ["bobkat", "stackscore"];
  return [site];
}
