import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { getAppUrl } from "@/lib/stripe/app-url";

describe("getAppUrl", () => {
  const original = { ...process.env };

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.AUTH_URL;
    delete process.env.VERCEL_URL;
  });

  afterEach(() => {
    process.env = { ...original };
  });

  it("prefers NEXT_PUBLIC_APP_URL", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://stackscore.bobkatit.com/";
    expect(getAppUrl()).toBe("https://stackscore.bobkatit.com");
  });

  it("falls back to AUTH_URL", () => {
    process.env.AUTH_URL = "http://localhost:3000";
    expect(getAppUrl()).toBe("http://localhost:3000");
  });

  it("defaults to localhost when unset", () => {
    expect(getAppUrl()).toBe("http://localhost:3000");
  });
});
