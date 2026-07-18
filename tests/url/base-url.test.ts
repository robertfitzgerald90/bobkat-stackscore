import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  buildAppUrl,
  CANONICAL_APP_ORIGIN,
  getBaseUrl,
  isLegacyAppHost,
} from "@/lib/url/base-url";

describe("getBaseUrl", () => {
  const original = { ...process.env };

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.AUTH_URL;
    delete process.env.VERCEL_URL;
  });

  afterEach(() => {
    process.env = { ...original };
  });

  it("prefers NEXT_PUBLIC_APP_URL in production", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://stackscore.tech/";
    expect(getBaseUrl()).toBe("https://stackscore.tech");
  });

  it("falls back to AUTH_URL", () => {
    process.env.AUTH_URL = "http://localhost:3000";
    expect(getBaseUrl()).toBe("http://localhost:3000");
  });

  it("defaults to localhost when unset", () => {
    expect(getBaseUrl()).toBe("http://localhost:3000");
  });

  it("uses Vercel preview host only when env URLs are unset", () => {
    process.env.VERCEL_URL = "stackscore-git-main-bobkat.vercel.app";
    expect(getBaseUrl()).toBe("https://stackscore-git-main-bobkat.vercel.app");
  });
});

describe("buildAppUrl", () => {
  const original = { ...process.env };

  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = "https://stackscore.tech";
  });

  afterEach(() => {
    process.env = { ...original };
  });

  it("joins paths without duplicate slashes", () => {
    expect(buildAppUrl("/login")).toBe("https://stackscore.tech/login");
    expect(buildAppUrl("assessment-offer")).toBe("https://stackscore.tech/assessment-offer");
  });

  it("preserves query strings in the path argument", () => {
    expect(buildAppUrl("/login?callbackUrl=%2Fdashboard")).toBe(
      "https://stackscore.tech/login?callbackUrl=%2Fdashboard",
    );
  });
});

describe("isLegacyAppHost", () => {
  it("detects the legacy production host", () => {
    expect(isLegacyAppHost("stackscore.bobkatit.com")).toBe(true);
    expect(isLegacyAppHost("www.stackscore.bobkatit.com")).toBe(true);
    expect(isLegacyAppHost("stackscore.tech")).toBe(false);
    expect(isLegacyAppHost("localhost:3000")).toBe(false);
  });
});

describe("CANONICAL_APP_ORIGIN", () => {
  it("uses the new production domain", () => {
    expect(CANONICAL_APP_ORIGIN).toBe("https://stackscore.tech");
  });
});
