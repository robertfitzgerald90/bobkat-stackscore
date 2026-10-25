import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHmac } from "node:crypto";
import { NextRequest } from "next/server";
import {
  AUTH_RATE_LIMIT_FAIL_MODE,
  AUTH_RATE_LIMIT_POLICIES,
} from "@/lib/auth/rate-limit/config";
import {
  hashRateLimitIdentifier,
  normalizeEmailIdentifier,
  resolveClientIp,
} from "@/lib/auth/rate-limit/keys";
import {
  RATE_LIMITED_CODE,
  TEMPORARILY_UNAVAILABLE_MESSAGE,
} from "@/lib/auth/rate-limit/responses";

type BucketState = { count: number; windowEndsAt: Date; scope: string };

const store = vi.hoisted(() => new Map<string, BucketState>());

const prismaMock = vi.hoisted(() => ({
  $queryRaw: vi.fn(),
  authRateLimitBucket: {
    findUnique: vi.fn(),
    deleteMany: vi.fn(),
  },
}));

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));

import {
  consumeRateLimit,
  getRateLimitCount,
  pruneExpiredRateLimitBuckets,
  enforceLoginRateLimits,
  clearLoginEmailFailures,
  enforcePasswordResetRequestLimits,
  enforcePasswordResetConfirmLimits,
  enforceActivationLimits,
  enforceSnapshotCreateLimits,
  enforceSnapshotContinueLimits,
} from "@/lib/auth/rate-limit";
import { POST as passwordResetPost, PUT as passwordResetPut } from "@/app/api/v1/public/password-reset/route";
import { POST as activateAccountPost } from "@/app/api/v1/public/activate-account/route";
import { POST as snapshotCreatePost } from "@/app/api/v1/public/technology-snapshot/route";
import { POST as snapshotContinuePost } from "@/app/api/v1/public/technology-snapshot/[leadId]/continue-assessment/route";

const AUTH_SECRET = "test-auth-secret-at-least-32-chars!!";

function expectedHash(scope: string, identifier: string): string {
  return createHmac("sha256", AUTH_SECRET)
    .update(`${scope}:${identifier.trim().toLowerCase()}`)
    .digest("hex");
}

/** Simulates PostgreSQL UPSERT semantics used by consumeRateLimit (shared durable store). */
function installAtomicUpsertMock() {
  prismaMock.$queryRaw.mockImplementation(async (strings: TemplateStringsArray, ...values: unknown[]) => {
    // VALUES (${id}, ${bucketKey}, ${scope}, 1, ${windowEndsAt}, ...) then CASE uses ${windowEndsAt} again
    const bucketKey = String(values[1]);
    const scope = String(values[2]);
    const windowEndsAt = values[3] as Date;
    const now = Date.now();
    const existing = store.get(bucketKey);

    if (!existing || existing.windowEndsAt.getTime() <= now) {
      const next = { count: 1, windowEndsAt, scope };
      store.set(bucketKey, next);
      return [{ count: next.count, windowEndsAt: next.windowEndsAt }];
    }

    existing.count += 1;
    store.set(bucketKey, existing);
    return [{ count: existing.count, windowEndsAt: existing.windowEndsAt }];
  });

  prismaMock.authRateLimitBucket.findUnique.mockImplementation(
    async ({ where }: { where: { bucketKey: string } }) => {
      const row = store.get(where.bucketKey);
      if (!row) return null;
      return { count: row.count, windowEndsAt: row.windowEndsAt };
    },
  );

  prismaMock.authRateLimitBucket.deleteMany.mockImplementation(
    async ({
      where,
    }: {
      where: { windowEndsAt?: { lt: Date }; bucketKey?: string };
    }) => {
      if (where.bucketKey) {
        const existed = store.delete(where.bucketKey);
        return { count: existed ? 1 : 0 };
      }
      const cutoff = where.windowEndsAt!.lt.getTime();
      let deleted = 0;
      for (const [key, row] of store.entries()) {
        if (row.windowEndsAt.getTime() < cutoff) {
          store.delete(key);
          deleted += 1;
        }
      }
      return { count: deleted };
    },
  );
}

const passwordResetService = vi.hoisted(() => ({
  requestPasswordReset: vi.fn(),
  confirmPasswordReset: vi.fn(),
}));

const activationService = vi.hoisted(() => ({
  activateAccount: vi.fn(),
  validateActivationToken: vi.fn(),
}));

const snapshotService = vi.hoisted(() => ({
  createTechnologySnapshotLead: vi.fn(),
}));

const continueService = vi.hoisted(() => ({
  continueSnapshotToFullAssessment: vi.fn(),
}));

vi.mock("@/lib/auth/password-reset", () => passwordResetService);
vi.mock("@/lib/auth/activation", () => activationService);
vi.mock("@/lib/technology-snapshot/service", () => snapshotService);
vi.mock("@/lib/communications/outreach/convert-snapshot-to-assessment", () => continueService);

describe("SS-SEC-004 auth rate limiting", () => {
  beforeEach(() => {
    store.clear();
    vi.clearAllMocks();
    process.env.AUTH_SECRET = AUTH_SECRET;
    installAtomicUpsertMock();
    passwordResetService.requestPasswordReset.mockResolvedValue(undefined);
    passwordResetService.confirmPasswordReset.mockResolvedValue(undefined);
    activationService.activateAccount.mockResolvedValue({ ok: true, email: "a@b.com" });
    snapshotService.createTechnologySnapshotLead.mockResolvedValue({
      lead: { id: "lead-1" },
      result: {
        totalScore: 50,
        classification: "emerging",
        observations: [],
        lowestPillars: [],
      },
    });
    continueService.continueSnapshotToFullAssessment.mockResolvedValue({
      ok: true,
      message: "Check your email",
    });
  });

  describe("identifier hashing and IP extraction", () => {
    it("HMAC-hashes identifiers and never equals the raw value", () => {
      const email = "Victim@Example.COM";
      const hash = hashRateLimitIdentifier("login_email_failures", email);
      expect(hash).toBe(expectedHash("login_email_failures", normalizeEmailIdentifier(email)));
      expect(hash).not.toContain("victim");
      expect(hash).not.toContain("@");
      expect(hash).toHaveLength(64);
    });

    it("scopes hashes so the same identifier differs across scopes", () => {
      const a = hashRateLimitIdentifier("login_ip", "1.2.3.4");
      const b = hashRateLimitIdentifier("password_reset_request_ip", "1.2.3.4");
      expect(a).not.toBe(b);
    });

    it("prefers x-vercel-forwarded-for over spoofable X-Forwarded-For", () => {
      const request = new Request("http://localhost", {
        headers: {
          "x-forwarded-for": "198.51.100.1, 10.0.0.1",
          "x-real-ip": "198.51.100.2",
          "x-vercel-forwarded-for": "203.0.113.10",
        },
      });
      expect(resolveClientIp(request)).toBe("203.0.113.10");
    });

    it("uses leftmost X-Forwarded-For hop when Vercel header is absent", () => {
      const request = new Request("http://localhost", {
        headers: { "x-forwarded-for": "203.0.113.10, 10.0.0.1" },
      });
      expect(resolveClientIp(request)).toBe("203.0.113.10");
    });

    it("falls back to x-real-ip then unknown", () => {
      expect(
        resolveClientIp(new Request("http://localhost", { headers: { "x-real-ip": "198.51.100.1" } })),
      ).toBe("198.51.100.1");
      expect(resolveClientIp(new Request("http://localhost"))).toBe("unknown");
    });
  });

  describe("threshold enforcement and windows", () => {
    it("enforces inclusive limit then blocks (attempts)", async () => {
      const limit = AUTH_RATE_LIMIT_POLICIES.password_reset_confirm_ip.limit;
      for (let i = 0; i < limit; i += 1) {
        const result = await consumeRateLimit({
          scope: "password_reset_confirm_ip",
          identifier: "10.0.0.1",
          failMode: "open",
        });
        expect(result.allowed).toBe(true);
      }
      const blocked = await consumeRateLimit({
        scope: "password_reset_confirm_ip",
        identifier: "10.0.0.1",
        failMode: "open",
      });
      expect(blocked.allowed).toBe(false);
      if (!blocked.allowed) {
        expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
      }
    });

    it("resets count after window expiration", async () => {
      const key = hashRateLimitIdentifier("activation_ip", "9.9.9.9");
      store.set(key, {
        count: 99,
        windowEndsAt: new Date(Date.now() - 1_000),
        scope: "activation_ip",
      });

      const result = await consumeRateLimit({
        scope: "activation_ip",
        identifier: "9.9.9.9",
        failMode: "open",
      });
      expect(result.allowed).toBe(true);
      expect(result.count).toBe(1);
    });

    it("login email admission is atomic and cleared on successful login", async () => {
      const request = new Request("http://localhost", {
        headers: { "x-vercel-forwarded-for": "203.0.113.50" },
      });
      const email = "user@example.com";

      for (let i = 0; i < 5; i += 1) {
        const admitted = await enforceLoginRateLimits({ request, email });
        expect(admitted.allowed).toBe(true);
      }

      const blocked = await enforceLoginRateLimits({ request, email });
      expect(blocked.allowed).toBe(false);
      expect(await getRateLimitCount("login_email_failures", email)).toBe(6);

      await clearLoginEmailFailures(email);
      expect(await getRateLimitCount("login_email_failures", email)).toBe(0);

      const afterClear = await enforceLoginRateLimits({ request, email });
      expect(afterClear.allowed).toBe(true);
    });
  });

  describe("concurrency and shared durable state", () => {
    it("atomic upsert keeps an exact total under concurrent consumes", async () => {
      const limit = AUTH_RATE_LIMIT_POLICIES.login_ip.limit;
      const total = limit + 5;
      const results = await Promise.all(
        Array.from({ length: total }, () =>
          consumeRateLimit({
            scope: "login_ip",
            identifier: "concurrent-ip",
            failMode: "open",
          }),
        ),
      );

      const allowed = results.filter((r) => r.allowed).length;
      const denied = results.filter((r) => !r.allowed).length;

      expect(allowed).toBe(limit);
      expect(denied).toBe(total - limit);
      expect(await getRateLimitCount("login_ip", "concurrent-ip")).toBe(total);
    });

    it("concurrent login email admissions cannot exceed the inclusive limit", async () => {
      const limit = AUTH_RATE_LIMIT_POLICIES.login_email_failures.limit;
      const total = limit + 8;
      const results = await Promise.all(
        Array.from({ length: total }, (_, i) =>
          enforceLoginRateLimits({
            request: new Request("http://localhost", {
              // Distinct IPs so only the email bucket constrains admission
              headers: { "x-vercel-forwarded-for": `203.0.113.${i + 1}` },
            }),
            email: "concurrent@example.com",
          }),
        ),
      );

      expect(results.filter((r) => r.allowed).length).toBe(limit);
      expect(results.filter((r) => !r.allowed).length).toBe(total - limit);
      expect(await getRateLimitCount("login_email_failures", "concurrent@example.com")).toBe(
        total,
      );
    });

    it("shared store behaves as distributed instances (second consumer sees first)", async () => {
      // Instance A
      for (let i = 0; i < 3; i += 1) {
        await consumeRateLimit({
          scope: "snapshot_continue_lead",
          identifier: "lead-shared",
          failMode: "closed",
        });
      }
      // Instance B (same durable store / DB)
      const fourth = await consumeRateLimit({
        scope: "snapshot_continue_lead",
        identifier: "lead-shared",
        failMode: "closed",
      });
      expect(fourth.allowed).toBe(false);
    });
  });

  describe("IP vs identifier limits", () => {
    it("password-reset request applies both IP and email limits", async () => {
      const request = new Request("http://localhost", {
        headers: { "x-forwarded-for": "203.0.113.77" },
      });

      for (let i = 0; i < 3; i += 1) {
        const ok = await enforcePasswordResetRequestLimits({
          request,
          email: "same@example.com",
        });
        expect(ok.allowed).toBe(true);
      }
      const emailBlocked = await enforcePasswordResetRequestLimits({
        request,
        email: "same@example.com",
      });
      expect(emailBlocked.allowed).toBe(false);

      // Different email, same IP still allowed until IP budget exhausted
      const otherEmail = await enforcePasswordResetRequestLimits({
        request,
        email: "other@example.com",
      });
      expect(otherEmail.allowed).toBe(true);
    });

    it("snapshot continue applies IP and lead identifier limits", async () => {
      const request = new Request("http://localhost", {
        headers: { "x-forwarded-for": "198.51.100.9" },
      });
      for (let i = 0; i < 3; i += 1) {
        expect(
          (await enforceSnapshotContinueLimits({ request, leadId: "lead-a" })).allowed,
        ).toBe(true);
      }
      expect((await enforceSnapshotContinueLimits({ request, leadId: "lead-a" })).allowed).toBe(
        false,
      );
      expect((await enforceSnapshotContinueLimits({ request, leadId: "lead-b" })).allowed).toBe(
        true,
      );
    });
  });

  describe("backend failure modes", () => {
    it("login / confirm / activation fail-open when backend errors", async () => {
      prismaMock.$queryRaw.mockRejectedValue(new Error("db down"));

      const login = await consumeRateLimit({
        scope: "login_ip",
        identifier: "1.1.1.1",
        failMode: AUTH_RATE_LIMIT_FAIL_MODE.login,
      });
      expect(login.allowed).toBe(true);
      expect(login.backendError).toBe(true);

      const confirm = await consumeRateLimit({
        scope: "password_reset_confirm_ip",
        identifier: "1.1.1.1",
        failMode: AUTH_RATE_LIMIT_FAIL_MODE.password_reset_confirm,
      });
      expect(confirm.allowed).toBe(true);

      const activation = await consumeRateLimit({
        scope: "activation_ip",
        identifier: "1.1.1.1",
        failMode: AUTH_RATE_LIMIT_FAIL_MODE.activation,
      });
      expect(activation.allowed).toBe(true);
    });

    it("password-reset request and snapshot flows fail-closed", async () => {
      prismaMock.$queryRaw.mockRejectedValue(new Error("db down"));

      const reset = await consumeRateLimit({
        scope: "password_reset_request_ip",
        identifier: "1.1.1.1",
        failMode: AUTH_RATE_LIMIT_FAIL_MODE.password_reset_request,
      });
      expect(reset.allowed).toBe(false);
      expect(reset.backendError).toBe(true);

      const create = await enforceSnapshotCreateLimits(
        new Request("http://localhost", { headers: { "x-forwarded-for": "1.1.1.1" } }),
      );
      expect(create.allowed).toBe(false);
      expect(create.backendError).toBe(true);

      const cont = await enforceSnapshotContinueLimits({
        request: new Request("http://localhost", { headers: { "x-forwarded-for": "1.1.1.1" } }),
        leadId: "lead-1",
      });
      expect(cont.allowed).toBe(false);
    });

    it("missing AUTH_SECRET fails according to failMode", async () => {
      delete process.env.AUTH_SECRET;
      const open = await consumeRateLimit({
        scope: "login_ip",
        identifier: "x",
        failMode: "open",
      });
      expect(open.allowed).toBe(true);
      expect(open.backendError).toBe(true);

      process.env.AUTH_SECRET = AUTH_SECRET;
    });
  });

  describe("route integration — anti-enumeration, tokens, responses", () => {
    it("password-reset request returns 429 without calling service when limited", async () => {
      const headers = { "x-forwarded-for": "203.0.113.20", "content-type": "application/json" };
      for (let i = 0; i < 3; i += 1) {
        await passwordResetPost(
          new Request("http://localhost/api/v1/public/password-reset", {
            method: "POST",
            headers,
            body: JSON.stringify({ email: "rate@example.com" }),
          }),
        );
      }
      const limited = await passwordResetPost(
        new Request("http://localhost/api/v1/public/password-reset", {
          method: "POST",
          headers,
          body: JSON.stringify({ email: "rate@example.com" }),
        }),
      );
      expect(limited.status).toBe(429);
      const body = await limited.json();
      expect(body.code).toBe(RATE_LIMITED_CODE);
      expect(passwordResetService.requestPasswordReset).toHaveBeenCalledTimes(3);
    });

    it("password-reset request returns generic 503 on backend failure (fail-closed)", async () => {
      prismaMock.$queryRaw.mockRejectedValue(new Error("db down"));
      const response = await passwordResetPost(
        new Request("http://localhost/api/v1/public/password-reset", {
          method: "POST",
          headers: { "content-type": "application/json", "x-forwarded-for": "1.1.1.1" },
          body: JSON.stringify({ email: "a@b.com" }),
        }),
      );
      expect(response.status).toBe(503);
      const body = await response.json();
      expect(body.error).toBe(TEMPORARILY_UNAVAILABLE_MESSAGE);
      expect(passwordResetService.requestPasswordReset).not.toHaveBeenCalled();
    });

    it("password-reset confirm does not call confirm when rate limited (token integrity)", async () => {
      const headers = { "x-forwarded-for": "203.0.113.30", "content-type": "application/json" };
      const token = "reset-token-value";
      for (let i = 0; i < 5; i += 1) {
        await passwordResetPut(
          new Request("http://localhost/api/v1/public/password-reset", {
            method: "PUT",
            headers,
            body: JSON.stringify({ token, password: "long-enough-password" }),
          }),
        );
      }
      passwordResetService.confirmPasswordReset.mockClear();
      const limited = await passwordResetPut(
        new Request("http://localhost/api/v1/public/password-reset", {
          method: "PUT",
          headers,
          body: JSON.stringify({ token, password: "long-enough-password" }),
        }),
      );
      expect(limited.status).toBe(429);
      expect(passwordResetService.confirmPasswordReset).not.toHaveBeenCalled();
    });

    it("activation does not call activateAccount when rate limited", async () => {
      const headers = { "x-forwarded-for": "203.0.113.40", "content-type": "application/json" };
      const token = "activation-token";
      for (let i = 0; i < 5; i += 1) {
        await activateAccountPost(
          new NextRequest("http://localhost/api/v1/public/activate-account", {
            method: "POST",
            headers,
            body: JSON.stringify({ token, password: "long-enough-password", name: "A" }),
          }),
        );
      }
      activationService.activateAccount.mockClear();
      const limited = await activateAccountPost(
        new NextRequest("http://localhost/api/v1/public/activate-account", {
          method: "POST",
          headers,
          body: JSON.stringify({ token, password: "long-enough-password", name: "A" }),
        }),
      );
      expect(limited.status).toBe(429);
      expect(activationService.activateAccount).not.toHaveBeenCalled();
    });

    it("snapshot create returns 429 when IP limited", async () => {
      const headers = { "x-forwarded-for": "203.0.113.60", "content-type": "application/json" };
      const body = {
        contactName: "Alex",
        email: "alex@example.com",
        companyName: "Co",
        answers: {},
      };
      // Fill create IP budget (10)
      for (let i = 0; i < 10; i += 1) {
        await snapshotCreatePost(
          new Request("http://localhost/api/v1/public/technology-snapshot", {
            method: "POST",
            headers,
            body: JSON.stringify(body),
          }),
        );
      }
      snapshotService.createTechnologySnapshotLead.mockClear();
      const limited = await snapshotCreatePost(
        new Request("http://localhost/api/v1/public/technology-snapshot", {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        }),
      );
      expect(limited.status).toBe(429);
      expect(snapshotService.createTechnologySnapshotLead).not.toHaveBeenCalled();
    });

    it("snapshot continue returns 429 without invoking continuation", async () => {
      const headers = { "x-forwarded-for": "203.0.113.70" };
      const leadId = "11111111-1111-4111-8111-111111111111";
      for (let i = 0; i < 3; i += 1) {
        await snapshotContinuePost(new Request("http://localhost", { headers }), {
          params: Promise.resolve({ leadId }),
        });
      }
      continueService.continueSnapshotToFullAssessment.mockClear();
      const limited = await snapshotContinuePost(new Request("http://localhost", { headers }), {
        params: Promise.resolve({ leadId }),
      });
      expect(limited.status).toBe(429);
      expect(continueService.continueSnapshotToFullAssessment).not.toHaveBeenCalled();
    });

    it("enforceActivationLimits and confirm limits share token identifier hashing", async () => {
      const request = new Request("http://localhost", {
        headers: { "x-forwarded-for": "10.0.0.8" },
      });
      const token = "Shared.Token.Value";
      for (let i = 0; i < 5; i += 1) {
        expect((await enforceActivationLimits({ request, token })).allowed).toBe(true);
      }
      expect((await enforceActivationLimits({ request, token })).allowed).toBe(false);

      // Confirm uses a different scope — independent budget
      expect(
        (await enforcePasswordResetConfirmLimits({ request, token })).allowed,
      ).toBe(true);
    });
  });

  describe("cleanup", () => {
    it("prunes buckets whose windows ended long ago", async () => {
      store.set("old", {
        count: 1,
        windowEndsAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        scope: "login_ip",
      });
      store.set("fresh", {
        count: 1,
        windowEndsAt: new Date(Date.now() + 60_000),
        scope: "login_ip",
      });
      const deleted = await pruneExpiredRateLimitBuckets(24 * 60 * 60 * 1000);
      expect(deleted).toBe(1);
      expect(store.has("old")).toBe(false);
      expect(store.has("fresh")).toBe(true);
    });
  });

  describe("policy documentation invariants", () => {
    it("documents attempts vs failures for each scope", () => {
      expect(AUTH_RATE_LIMIT_POLICIES.login_ip.counts).toBe("attempts");
      expect(AUTH_RATE_LIMIT_POLICIES.login_email_failures.counts).toBe("failures");
      expect(AUTH_RATE_LIMIT_POLICIES.password_reset_request_email.counts).toBe("attempts");
      expect(AUTH_RATE_LIMIT_POLICIES.snapshot_continue_lead.counts).toBe("attempts");
    });
  });
});
