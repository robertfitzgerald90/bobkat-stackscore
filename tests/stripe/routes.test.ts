import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Stripe integration routes", () => {
  it("exposes checkout and webhook route handlers", () => {
    const checkout = readFileSync(
      resolve(process.cwd(), "src/app/api/checkout/create-session/route.ts"),
      "utf8",
    );
    const webhook = readFileSync(
      resolve(process.cwd(), "src/app/api/webhooks/stripe/route.ts"),
      "utf8",
    );

    expect(checkout).toContain("checkout.sessions.create");
    expect(checkout).toContain("productType");
    expect(checkout).toContain("TECHNOLOGY_ASSESSMENT_PRODUCT_TYPE");

    const config = readFileSync(
      resolve(process.cwd(), "src/lib/stripe/config.ts"),
      "utf8",
    );
    expect(config).toContain("STRIPE_ASSESSMENT_PRICE_ID");
    expect(webhook).toContain("constructEvent");
    expect(webhook).toContain("checkout.session.completed");
  });

  it("allows public access to offer and success pages", () => {
    const authConfig = readFileSync(
      resolve(process.cwd(), "src/lib/auth/auth.config.ts"),
      "utf8",
    );

    expect(authConfig).toContain('pathname.startsWith("/assessment-offer")');
    expect(authConfig).toContain('pathname.startsWith("/activate-account")');
    expect(authConfig).toContain('pathname.startsWith("/purchase/success")');
  });
});
