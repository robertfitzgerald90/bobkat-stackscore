import { describe, expect, it } from "vitest";
import { isValidCheckoutSessionId } from "@/lib/stripe/retrieve-checkout-session";

describe("isValidCheckoutSessionId", () => {
  it("accepts Stripe checkout session ids", () => {
    expect(isValidCheckoutSessionId("cs_test_abc123XYZ")).toBe(true);
    expect(isValidCheckoutSessionId("cs_live_abc123XYZ")).toBe(true);
  });

  it("rejects malformed ids before Stripe is called", () => {
    expect(isValidCheckoutSessionId(undefined)).toBe(false);
    expect(isValidCheckoutSessionId("")).toBe(false);
    expect(isValidCheckoutSessionId("not-a-session")).toBe(false);
    expect(isValidCheckoutSessionId("cs_")).toBe(false);
    expect(isValidCheckoutSessionId("pi_test_123")).toBe(false);
  });
});
