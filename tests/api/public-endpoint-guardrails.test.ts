import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AUTH_RATE_LIMIT_FAIL_MODE,
  AUTH_RATE_LIMIT_POLICIES,
} from "@/lib/auth/rate-limit/config";

const prismaMock = vi.hoisted(() => ({
  $queryRaw: vi.fn(),
}));

const rateLimitMock = vi.hoisted(() => ({
  enforceHealthIpLimits: vi.fn(),
  enforceProductOverviewPdfLimits: vi.fn(),
  enforceCheckoutCreateLimits: vi.fn(),
  enforceCheckoutVcioLimits: vi.fn(),
  enforceWebsiteLeadsIpLimits: vi.fn(),
  tooManyRequestsResponse: vi.fn((retryAfterSeconds?: number) => {
    return new Response(JSON.stringify({ code: "RATE_LIMITED" }), {
      status: 429,
      headers: retryAfterSeconds
        ? { "Retry-After": String(retryAfterSeconds), "Content-Type": "application/json" }
        : { "Content-Type": "application/json" },
    });
  }),
  temporarilyUnavailableResponse: vi.fn((retryAfterSeconds?: number) => {
    return new Response(JSON.stringify({ code: "TEMPORARILY_UNAVAILABLE" }), {
      status: 503,
      headers: retryAfterSeconds
        ? { "Retry-After": String(retryAfterSeconds), "Content-Type": "application/json" }
        : { "Content-Type": "application/json" },
    });
  }),
}));

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/rate-limit", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth/rate-limit")>(
    "@/lib/auth/rate-limit",
  );
  return {
    ...actual,
    ...rateLimitMock,
  };
});

function source(rel: string): string {
  return readFileSync(resolve(process.cwd(), rel), "utf8");
}

describe("SS-SEC-007 public endpoint guardrails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rateLimitMock.enforceHealthIpLimits.mockResolvedValue({
      allowed: true,
      remaining: 59,
      retryAfterSeconds: 0,
      backendError: false,
    });
    prismaMock.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);
    process.env.AUTH_SECRET = "test-auth-secret-at-least-32-chars!!";
    process.env.AUTH_URL = "https://staging.example.com";
  });

  describe("policies (M01–M03, M06, M07)", () => {
    it("defines durable IP policies for public abuse surfaces", () => {
      expect(AUTH_RATE_LIMIT_POLICIES.health_ip.limit).toBe(60);
      expect(AUTH_RATE_LIMIT_POLICIES.product_overview_pdf_ip.limit).toBe(10);
      expect(AUTH_RATE_LIMIT_POLICIES.checkout_create_ip.limit).toBe(10);
      expect(AUTH_RATE_LIMIT_POLICIES.checkout_vcio_ip.limit).toBe(10);
      expect(AUTH_RATE_LIMIT_POLICIES.website_leads_ip.limit).toBe(30);
    });

    it("fail-opens health probes and fail-closes PDF/checkout/leads", () => {
      expect(AUTH_RATE_LIMIT_FAIL_MODE.health).toBe("open");
      expect(AUTH_RATE_LIMIT_FAIL_MODE.product_overview_pdf).toBe("closed");
      expect(AUTH_RATE_LIMIT_FAIL_MODE.checkout_create).toBe("closed");
      expect(AUTH_RATE_LIMIT_FAIL_MODE.checkout_vcio).toBe("closed");
      expect(AUTH_RATE_LIMIT_FAIL_MODE.website_leads).toBe("closed");
    });
  });

  describe("SEC-001-M01 health information disclosure", () => {
    it("wires durable health_ip limits and returns minimal status only", async () => {
      const healthSrc = source("src/app/api/v1/health/route.ts");
      expect(healthSrc).toContain("enforceHealthIpLimits");
      expect(healthSrc).not.toMatch(/checks\s*:/);
      expect(healthSrc).toContain('{ status: healthy ? "ok" : "unhealthy" }');

      const { GET } = await import("@/app/api/v1/health/route");
      const res = await GET(new Request("http://localhost/api/v1/health"));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual({ status: "ok" });
      expect(body).not.toHaveProperty("checks");
      expect(body).not.toHaveProperty("environment");
    });

    it("returns 429 when health IP limit exceeded (not backend error)", async () => {
      rateLimitMock.enforceHealthIpLimits.mockResolvedValue({
        allowed: false,
        remaining: 0,
        retryAfterSeconds: 12,
        backendError: false,
      });
      const { GET } = await import("@/app/api/v1/health/route");
      const res = await GET(new Request("http://localhost/api/v1/health"));
      expect(res.status).toBe(429);
    });

    it("continues probing when health limiter backend errors (fail-open)", async () => {
      rateLimitMock.enforceHealthIpLimits.mockResolvedValue({
        allowed: false,
        remaining: 0,
        retryAfterSeconds: 30,
        backendError: true,
      });
      const { GET } = await import("@/app/api/v1/health/route");
      const res = await GET(new Request("http://localhost/api/v1/health"));
      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ status: "ok" });
    });
  });

  describe("route wiring — PDF / checkout / website-leads", () => {
    it("retires product-overview PDF with HTTP 410 (SS-WEB-003-R2)", () => {
      const pdf = source("src/app/api/product-overview/pdf/route.ts");
      expect(pdf).toContain("status: 410");
      expect(pdf).toContain("/demo/overview");
      expect(pdf).not.toContain("generateProductOverviewPdf");
      expect(pdf).not.toContain("enforceProductOverviewPdfLimits");
    });

    it("rate-limits assessment checkout create-session (M03)", () => {
      const checkout = source("src/app/api/checkout/create-session/route.ts");
      expect(checkout).toContain("enforceCheckoutCreateLimits");
      expect(checkout).toContain("checkout.sessions.create");
      expect(checkout).toContain("buildAssessmentCheckoutMetadata");
    });

    it("rate-limits vCIO checkout while preserving optional session (M06)", () => {
      const vcio = source("src/app/api/checkout/vcio/route.ts");
      expect(vcio).toContain("enforceCheckoutVcioLimits");
      expect(vcio).toContain("checkout.sessions.create");
    });

    it("uses durable website_leads_ip instead of in-memory Map (M07)", () => {
      const route = source("src/app/api/integrations/website-leads/route.ts");
      expect(route).toContain("enforceWebsiteLeadsIpLimits");
      expect(route).not.toContain("checkWebsiteLeadRateLimit");

      const legacy = source("src/lib/website-leads/rate-limit.ts");
      expect(legacy).not.toContain("new Map");
      expect(legacy).toContain("resolveRateLimitKey");
    });
  });
});
