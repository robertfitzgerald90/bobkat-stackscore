import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

describe("environment validation", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it("accepts valid development configuration", async () => {
    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
    process.env.AUTH_SECRET = "dev-secret-at-least-32-characters-long";
    process.env.NODE_ENV = "development";

    const { getEnv } = await import("@/lib/env");
    const env = getEnv();

    expect(env.DATABASE_URL).toContain("postgresql");
    expect(env.AUTH_SECRET).toBeTruthy();
  });

  it("rejects missing DATABASE_URL", async () => {
    delete process.env.DATABASE_URL;
    process.env.AUTH_SECRET = "dev-secret-at-least-32-characters-long";
    process.env.NODE_ENV = "development";

    const { getEnv } = await import("@/lib/env");
    expect(() => getEnv()).toThrow(/DATABASE_URL/);
  });

  it("rejects short AUTH_SECRET in production at runtime", async () => {
    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
    process.env.AUTH_SECRET = "too-short";
    process.env.NODE_ENV = "production";
    delete process.env.NEXT_PHASE;

    const { getEnv } = await import("@/lib/env");
    expect(() => getEnv()).toThrow(/AUTH_SECRET/);
  });

  it("allows short AUTH_SECRET during next build phase", async () => {
    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
    process.env.AUTH_SECRET = "too-short";
    process.env.NODE_ENV = "production";
    process.env.NEXT_PHASE = "phase-production-build";

    const { getEnv } = await import("@/lib/env");
    expect(getEnv().AUTH_SECRET).toBe("too-short");
  });
});
