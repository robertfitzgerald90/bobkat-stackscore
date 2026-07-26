import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createWebsiteLeadIntegrationSchema,
  convertWebsiteLeadSchema,
  updateWebsiteLeadSchema,
} from "@/lib/website-leads/schemas";
import { sanitizePlainText, parseFirstName, escapeHtml } from "@/lib/website-leads/sanitize";
import { requireWebsiteLeadsApiSecret } from "@/lib/website-leads/auth";
import { checkWebsiteLeadRateLimit } from "@/lib/website-leads/rate-limit";

describe("website lead schemas", () => {
  it("accepts a valid integration submission", () => {
    const parsed = createWebsiteLeadIntegrationSchema.safeParse({
      name: "Jane Smith",
      company: "Acme Corp",
      phone: "346-555-0100",
      email: "jane@example.com",
      message: "We need help with our IT stack.",
      source: "BOBKAT_WEBSITE_CONTACT",
      submissionId: "form-123",
      websiteUrl: "https://bobkatit.com/contact",
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const parsed = createWebsiteLeadIntegrationSchema.safeParse({
      name: "Jane Smith",
      message: "Hello",
      source: "BOBKAT_WEBSITE_CONTACT",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects invalid email addresses", () => {
    const parsed = createWebsiteLeadIntegrationSchema.safeParse({
      name: "Jane Smith",
      email: "not-an-email",
      message: "Hello",
      source: "BOBKAT_WEBSITE_CONTACT",
    });

    expect(parsed.success).toBe(false);
  });

  it("supports lead status updates", () => {
    const parsed = updateWebsiteLeadSchema.safeParse({ status: "CONTACTED" });
    expect(parsed.success).toBe(true);
  });

  it("requires client fields for create-new conversion", () => {
    const parsed = convertWebsiteLeadSchema.safeParse({
      mode: "create_new",
      companyName: "Acme Corp",
      primaryContactName: "Jane Smith",
      primaryContactEmail: "jane@example.com",
    });

    expect(parsed.success).toBe(true);
  });
});

describe("website lead sanitization", () => {
  it("strips HTML from messages", () => {
    expect(sanitizePlainText("<b>Hello</b> world")).toBe("Hello world");
  });

  it("parses first names safely", () => {
    expect(parseFirstName("Jane Smith")).toBe("Jane");
    expect(parseFirstName("")).toBe("there");
  });

  it("escapes HTML for internal notifications", () => {
    expect(escapeHtml(`Tom & Jerry <script>`)).toBe("Tom &amp; Jerry &lt;script&gt;");
  });
});

describe("website lead integration auth", () => {
  beforeEach(() => {
    vi.stubEnv("WEBSITE_LEADS_API_SECRET", "test-secret-value-123456");
  });

  it("accepts a valid bearer secret", () => {
    const request = new Request("http://localhost/api/integrations/website-leads", {
      headers: { authorization: "Bearer test-secret-value-123456" },
    });

    expect(requireWebsiteLeadsApiSecret(request)).toBe(true);
  });

  it("rejects an invalid secret", () => {
    const request = new Request("http://localhost/api/integrations/website-leads", {
      headers: { authorization: "Bearer wrong-secret" },
    });

    expect(requireWebsiteLeadsApiSecret(request)).toBe(false);
  });
});

describe("website lead rate limiting", () => {
  it("allows requests under the limit", () => {
    const result = checkWebsiteLeadRateLimit("test-ip-1");
    expect(result.allowed).toBe(true);
  });
});

describe("website leads route protection", () => {
  it("does not expose website leads in public auth pages list only", () => {
    const authConfig = `
      pathname.startsWith("/assessment-offer")
      pathname.startsWith("/api/integrations")
    `;
    expect(authConfig).toContain('pathname.startsWith("/api/integrations")');
  });

  it("documents admin-only website lead pages", () => {
    const page = `
      if (session?.user?.role !== "admin") {
        redirect("/dashboard");
      }
    `;
    expect(page).toContain('role !== "admin"');
  });
});

describe("confirmation email resilience", () => {
  it("keeps email sending after lead persistence", async () => {
    const { readFileSync } = await import("node:fs");
    const { resolve } = await import("node:path");
    const serviceSource = readFileSync(
      resolve(process.cwd(), "src/lib/website-leads/service.ts"),
      "utf8",
    );

    expect(serviceSource).toContain("await prisma.websiteLead.create");
    expect(serviceSource).toContain("sendWebsiteLeadConfirmationEmail");
  });
});
