import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma loads this file during `postinstall` / `prisma generate` on Vercel before
 * runtime env injection is guaranteed. A placeholder URL is only used for client
 * generation — never for migrations or app queries.
 */
function resolveDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  if (process.env.VERCEL || process.env.CI) {
    return "postgresql://build:build@127.0.0.1:5432/build?schema=public";
  }

  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env for local development.",
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: resolveDatabaseUrl(),
  },
});
