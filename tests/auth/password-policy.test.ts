import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_LENGTH_MESSAGE,
  assertPasswordMeetsPolicy,
  passwordSchema,
  validatePassword,
} from "@/lib/users/password-policy";
import { createUserSchema, updateUserSchema } from "@/lib/users/schemas";

const prismaMock = vi.hoisted(() => ({
  passwordResetToken: {
    findFirst: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
  accountActivationToken: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));

vi.mock("@/lib/communications/queue/service", () => ({
  enqueueCommunication: vi.fn(),
}));

vi.mock("@/lib/communications/activity/record-activity", () => ({
  recordOrganizationActivity: vi.fn(),
}));

describe("shared password policy (SS-SEC-003 / TM-H02)", () => {
  it("TM-H02-a: passwords shorter than 10 characters are rejected", () => {
    expect(validatePassword("short")).toEqual({
      ok: false,
      error: PASSWORD_MIN_LENGTH_MESSAGE,
    });
    expect(validatePassword("123456789")).toEqual({
      ok: false,
      error: PASSWORD_MIN_LENGTH_MESSAGE,
    });
    expect(() => assertPasswordMeetsPolicy("abcdefghi")).toThrow(PASSWORD_MIN_LENGTH_MESSAGE);
  });

  it("TM-H02-b: password of exactly 10 characters is accepted", () => {
    const password = "a".repeat(PASSWORD_MIN_LENGTH);
    expect(validatePassword(password)).toEqual({ ok: true, password });
    expect(assertPasswordMeetsPolicy(password)).toBe(password);
    expect(passwordSchema.safeParse(password).success).toBe(true);
  });

  it("rejects empty passwords", () => {
    expect(validatePassword("")).toEqual({ ok: false, error: "Password is required" });
    expect(validatePassword(undefined)).toEqual({ ok: false, error: "Password is required" });
    expect(validatePassword(null)).toEqual({ ok: false, error: "Password is required" });
  });

  it("error messages never include the submitted password", () => {
    const secret = "leak-me!!"; // 9 chars — fails policy
    const result = validatePassword(secret);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).not.toContain(secret);
      expect(result.error).not.toContain("leak");
    }
    try {
      assertPasswordMeetsPolicy(secret);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).not.toContain(secret);
    }
  });

  it("createUserSchema and updateUserSchema use the shared policy", () => {
    expect(
      createUserSchema.safeParse({
        name: "A",
        email: "a@example.com",
        password: "short",
        role: "client",
      }).success,
    ).toBe(false);

    expect(
      createUserSchema.safeParse({
        name: "A",
        email: "a@example.com",
        password: "longenough1",
        role: "client",
      }).success,
    ).toBe(true);

    expect(updateUserSchema.safeParse({ password: "short" }).success).toBe(false);
    expect(updateUserSchema.safeParse({ password: "longenough1" }).success).toBe(true);
    expect(updateUserSchema.safeParse({ name: "Only name" }).success).toBe(true);
  });
});

describe("confirmPasswordReset policy enforcement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockResolvedValue([]);
  });

  it("rejects short passwords before consuming a valid reset token", async () => {
    const { confirmPasswordReset } = await import("@/lib/auth/password-reset");

    await expect(
      confirmPasswordReset({ token: "valid-looking-token", password: "short" }),
    ).rejects.toThrow(PASSWORD_MIN_LENGTH_MESSAGE);

    expect(prismaMock.passwordResetToken.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.user.update).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("accepts a 10-character password and updates the user", async () => {
    const { confirmPasswordReset } = await import("@/lib/auth/password-reset");
    const rawToken = "reset-token-value";
    prismaMock.passwordResetToken.findFirst.mockResolvedValue({
      id: "tok-1",
      userId: "user-1",
      tokenHash: createHash("sha256").update(rawToken).digest("hex"),
      usedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user: {
        id: "user-1",
        email: "user@example.com",
        clientId: null,
      },
    });

    await expect(
      confirmPasswordReset({ token: rawToken, password: "longenough1" }),
    ).resolves.toEqual({ success: true });

    expect(prismaMock.passwordResetToken.findFirst).toHaveBeenCalled();
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });
});

describe("activateAccount password policy (TM-H02-c)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TM-H02-c: account activation rejects short passwords without DB writes", async () => {
    const { activateAccount } = await import("@/lib/auth/activation");

    await expect(
      activateAccount({ token: "any-token", password: "short" }),
    ).rejects.toThrow();

    expect(prismaMock.accountActivationToken.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("activation accepts a 10-character password through shared schema", async () => {
    const { activateAccount } = await import("@/lib/auth/activation");
    const raw = "activation-token";
    const tokenHash = createHash("sha256").update(raw).digest("hex");

    prismaMock.accountActivationToken.findUnique.mockResolvedValue({
      id: "act-1",
      userId: "user-1",
      tokenHash,
      usedAt: null,
      expiresAt: new Date(Date.now() + 86_400_000),
      user: {
        id: "user-1",
        email: "client@example.com",
        role: "client",
        isActive: false,
        clientId: null,
      },
    });
    prismaMock.$transaction.mockImplementation(async (ops: unknown) => {
      if (Array.isArray(ops)) return Promise.all(ops);
      return ops;
    });
    prismaMock.user.update.mockResolvedValue({});
    prismaMock.accountActivationToken.update.mockResolvedValue({});

    const result = await activateAccount({
      token: raw,
      password: "longenough1",
    });

    expect(result.ok).toBe(true);
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });
});

describe("hashPassword policy gate", () => {
  it("refuses to hash passwords that fail policy", async () => {
    const { hashPassword } = await import("@/lib/users/password");
    await expect(hashPassword("short")).rejects.toThrow(PASSWORD_MIN_LENGTH_MESSAGE);
  });

  it("hashes passwords that meet policy without embedding plaintext", async () => {
    const { hashPassword, BCRYPT_ROUNDS } = await import("@/lib/users/password");
    expect(BCRYPT_ROUNDS).toBe(12);
    const hash = await hashPassword("longenough1");
    expect(hash).toMatch(/^\$2[aby]?\$/);
    expect(hash).not.toContain("longenough1");
  });
});
