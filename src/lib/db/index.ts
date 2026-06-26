import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { normalizeDatabaseUrl, usesNeonSsl } from "@/lib/db/connection";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function createPrismaClient() {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    throw new Error(
      "DATABASE_URL is not set. Use .env locally or Vercel environment variables in production.",
    );
  }

  const connectionString = normalizeDatabaseUrl(rawUrl);

  const pool =
    globalForPrisma.pool ??
    new Pool({
      connectionString,
      max: process.env.VERCEL ? 3 : 10,
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 30_000,
      ssl: usesNeonSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
  }

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
