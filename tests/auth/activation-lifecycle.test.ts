import { createHash } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  accountActivationToken: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  user: {
    update: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(async () => "hashed-password"),
  },
}));

import { activateAccount, validateActivationToken } from "@/lib/auth/activation";

function hashToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

describe("activation token lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (ops: unknown) => {
      if (Array.isArray(ops)) {
        return Promise.all(ops);
      }
      return ops;
    });
    prismaMock.user.update.mockResolvedValue({});
    prismaMock.accountActivationToken.update.mockResolvedValue({});
  });

  it("rejects invalid activation tokens", async () => {
    prismaMock.accountActivationToken.findUnique.mockResolvedValue(null);
    const result = await activateAccount({
      token: "not-a-real-token",
      password: "long-enough-password",
    });
    expect(result).toEqual({
      ok: false,
      error: "Invalid or expired activation link",
    });
  });

  it("rejects expired activation tokens", async () => {
    const raw = "expired-token-value";
    prismaMock.accountActivationToken.findUnique.mockResolvedValue({
      id: "tok-1",
      userId: "user-1",
      tokenHash: hashToken(raw),
      usedAt: null,
      expiresAt: new Date(Date.now() - 60_000),
      user: {
        id: "user-1",
        email: "a@example.com",
        role: "client",
        isActive: false,
        clientId: "client-1",
      },
    });

    const result = await activateAccount({
      token: raw,
      password: "long-enough-password",
    });
    expect(result).toEqual({
      ok: false,
      error: "This activation link has expired",
    });
  });

  it("rejects already-used activation tokens (single-use)", async () => {
    const raw = "used-token-value";
    prismaMock.accountActivationToken.findUnique.mockResolvedValue({
      id: "tok-2",
      userId: "user-1",
      tokenHash: hashToken(raw),
      usedAt: new Date(),
      expiresAt: new Date(Date.now() + 86_400_000),
      user: {
        id: "user-1",
        email: "a@example.com",
        role: "client",
        isActive: true,
        clientId: "client-1",
      },
    });

    const result = await activateAccount({
      token: raw,
      password: "long-enough-password",
    });
    expect(result).toEqual({
      ok: false,
      error: "This activation link has already been used",
    });
  });

  it("marks token used on successful activation", async () => {
    const raw = "fresh-token-value";
    prismaMock.accountActivationToken.findUnique.mockResolvedValue({
      id: "tok-3",
      userId: "user-1",
      tokenHash: hashToken(raw),
      usedAt: null,
      expiresAt: new Date(Date.now() + 86_400_000),
      user: {
        id: "user-1",
        email: "a@example.com",
        role: "client",
        isActive: false,
        clientId: null,
      },
    });

    const result = await activateAccount({
      token: raw,
      password: "long-enough-password",
    });

    expect(result.ok).toBe(true);
    expect(prismaMock.$transaction).toHaveBeenCalled();
    expect(prismaMock.accountActivationToken.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "tok-3" },
        data: { usedAt: expect.any(Date) },
      }),
    );
  });

  it("validateActivationToken rejects expired and used tokens", async () => {
    prismaMock.accountActivationToken.findUnique.mockResolvedValue({
      usedAt: null,
      expiresAt: new Date(Date.now() - 1),
      user: { email: "a@example.com", name: "A", isActive: false },
    });
    expect(await validateActivationToken("x")).toEqual({ valid: false });

    prismaMock.accountActivationToken.findUnique.mockResolvedValue({
      usedAt: new Date(),
      expiresAt: new Date(Date.now() + 100_000),
      user: { email: "a@example.com", name: "A", isActive: false },
    });
    expect(await validateActivationToken("y")).toEqual({ valid: false });
  });
});

describe("environment-specific activation URLs", () => {
  it("activation links are built from getBaseUrl (NEXT_PUBLIC_APP_URL / AUTH_URL)", async () => {
    const previous = process.env.NEXT_PUBLIC_APP_URL;
    process.env.NEXT_PUBLIC_APP_URL = "https://staging.stackscore.example";
    vi.resetModules();
    const { getBaseUrl, buildAppUrl } = await import("@/lib/url/base-url");
    const rawToken = "env-token-abc";
    const activationUrl = `${getBaseUrl()}/activate-account?token=${encodeURIComponent(rawToken)}`;
    expect(getBaseUrl()).toBe("https://staging.stackscore.example");
    expect(activationUrl).toBe(
      "https://staging.stackscore.example/activate-account?token=env-token-abc",
    );
    expect(buildAppUrl(`/activate-account?token=${encodeURIComponent(rawToken)}`)).toContain(
      "staging.stackscore.example",
    );
    process.env.NEXT_PUBLIC_APP_URL = previous;
  });
});
