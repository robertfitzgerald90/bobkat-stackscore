import { afterEach, describe, expect, it } from "vitest";
import {
  buildProtectedAppUrl,
  buildPublicAppUrl,
} from "@/lib/communications/links/build-protected-url";

describe("communication app links", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.AUTH_URL;
  });

  it("builds activation links on the canonical origin", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://stackscore.tech";
    expect(buildPublicAppUrl("/activate-account?token=abc123")).toBe(
      "https://stackscore.tech/activate-account?token=abc123",
    );
  });

  it("builds protected login redirects with callback paths", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://stackscore.tech";
    expect(buildProtectedAppUrl("/dashboard")).toBe(
      "https://stackscore.tech/login?callbackUrl=%2Fdashboard",
    );
  });

  it("builds password reset links on localhost in development", () => {
    process.env.AUTH_URL = "http://localhost:3000";
    expect(buildPublicAppUrl("/reset-password?token=abc123")).toBe(
      "http://localhost:3000/reset-password?token=abc123",
    );
  });
});
