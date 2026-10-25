-- SS-SEC-004: Durable authentication abuse-protection buckets (PostgreSQL / Neon)
CREATE TABLE "AuthRateLimitBucket" (
    "id" TEXT NOT NULL,
    "bucketKey" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "windowEndsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthRateLimitBucket_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AuthRateLimitBucket_bucketKey_key" ON "AuthRateLimitBucket"("bucketKey");
CREATE INDEX "AuthRateLimitBucket_windowEndsAt_idx" ON "AuthRateLimitBucket"("windowEndsAt");
CREATE INDEX "AuthRateLimitBucket_scope_idx" ON "AuthRateLimitBucket"("scope");
