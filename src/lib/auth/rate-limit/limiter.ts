import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import {
  AUTH_RATE_LIMIT_POLICIES,
  type RateLimitFailMode,
  type RateLimitScope,
} from "./config";
import { hashRateLimitIdentifier } from "./keys";

export type ConsumeRateLimitResult =
  | {
      allowed: true;
      count: number;
      remaining: number;
      retryAfterSeconds?: undefined;
      backendError?: boolean;
    }
  | {
      allowed: false;
      count: number;
      remaining: 0;
      retryAfterSeconds: number;
      backendError?: boolean;
    };

type BucketRow = {
  count: number;
  windowEndsAt: Date;
};

/**
 * Atomically increments a durable rate-limit bucket (PostgreSQL UPSERT).
 * Safe under concurrent serverless invocations.
 */
export async function consumeRateLimit(input: {
  scope: RateLimitScope;
  identifier: string;
  failMode: RateLimitFailMode;
}): Promise<ConsumeRateLimitResult> {
  const policy = AUTH_RATE_LIMIT_POLICIES[input.scope];

  let bucketKey: string;
  try {
    bucketKey = hashRateLimitIdentifier(input.scope, input.identifier);
  } catch (error) {
    return handleBackendFailure(input.failMode, error, "hash");
  }

  const now = Date.now();
  const windowEndsAt = new Date(now + policy.windowMs);
  const id = randomUUID();

  try {
    const rows = await prisma.$queryRaw<BucketRow[]>`
      INSERT INTO "AuthRateLimitBucket" ("id", "bucketKey", "scope", "count", "windowEndsAt", "createdAt", "updatedAt")
      VALUES (${id}, ${bucketKey}, ${policy.scope}, 1, ${windowEndsAt}, NOW(), NOW())
      ON CONFLICT ("bucketKey") DO UPDATE SET
        "count" = CASE
          WHEN "AuthRateLimitBucket"."windowEndsAt" <= NOW() THEN 1
          ELSE "AuthRateLimitBucket"."count" + 1
        END,
        "windowEndsAt" = CASE
          WHEN "AuthRateLimitBucket"."windowEndsAt" <= NOW() THEN ${windowEndsAt}
          ELSE "AuthRateLimitBucket"."windowEndsAt"
        END,
        "updatedAt" = NOW()
      RETURNING "count", "windowEndsAt"
    `;

    const row = rows[0];
    if (!row) {
      return handleBackendFailure(input.failMode, new Error("empty upsert result"), "upsert");
    }

    // Opportunistic cleanup of expired buckets (bounded).
    if (Math.random() < 0.02) {
      void pruneExpiredRateLimitBuckets().catch(() => undefined);
    }

    const count = Number(row.count);
    const endsAt = new Date(row.windowEndsAt).getTime();
    const retryAfterSeconds = Math.max(1, Math.ceil((endsAt - Date.now()) / 1000));

    if (count > policy.limit) {
      return {
        allowed: false,
        count,
        remaining: 0,
        retryAfterSeconds,
      };
    }

    return {
      allowed: true,
      count,
      remaining: Math.max(0, policy.limit - count),
    };
  } catch (error) {
    return handleBackendFailure(input.failMode, error, "upsert");
  }
}

/** Peek without increment — used sparingly in tests; prefer consume for enforcement. */
export async function getRateLimitCount(scope: RateLimitScope, identifier: string): Promise<number> {
  const bucketKey = hashRateLimitIdentifier(scope, identifier);
  const row = await prisma.authRateLimitBucket.findUnique({
    where: { bucketKey },
    select: { count: true, windowEndsAt: true },
  });
  if (!row) return 0;
  if (row.windowEndsAt.getTime() <= Date.now()) return 0;
  return row.count;
}

/**
 * Clears a login email failure/admission bucket after a successful credentials login.
 * Failures during clear must not block sign-in (login fail-open).
 */
export async function clearRateLimitBucket(
  scope: RateLimitScope,
  identifier: string,
): Promise<void> {
  try {
    const bucketKey = hashRateLimitIdentifier(scope, identifier);
    await prisma.authRateLimitBucket.deleteMany({ where: { bucketKey } });
  } catch (error) {
    console.warn("[auth.rate-limit] clear bucket failed", {
      scope,
      message: error instanceof Error ? error.message : "unknown",
    });
  }
}

export async function pruneExpiredRateLimitBuckets(olderThanMs = 24 * 60 * 60 * 1000): Promise<number> {
  const cutoff = new Date(Date.now() - olderThanMs);
  const result = await prisma.authRateLimitBucket.deleteMany({
    where: { windowEndsAt: { lt: cutoff } },
  });
  return result.count;
}

function handleBackendFailure(
  failMode: RateLimitFailMode,
  error: unknown,
  phase: string,
): ConsumeRateLimitResult {
  console.warn("[auth.rate-limit] backend unavailable", {
    phase,
    failMode,
    message: error instanceof Error ? error.message : "unknown",
  });

  if (failMode === "closed") {
    return {
      allowed: false,
      count: 0,
      remaining: 0,
      retryAfterSeconds: 60,
      backendError: true,
    };
  }

  return {
    allowed: true,
    count: 0,
    remaining: Number.POSITIVE_INFINITY,
    backendError: true,
  };
}
