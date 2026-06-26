/**
 * Vercel production build.
 * - Requires DATABASE_URL in Vercel env (Neon) for migrations + runtime.
 * - Local dev uses .env; production uses Vercel dashboard only.
 */
import { execSync } from "node:child_process";

function run(command) {
  console.log(`\n> ${command}`);
  execSync(command, { stdio: "inherit", env: process.env });
}

function fail(step, error) {
  console.error(`\nVercel build failed during: ${step}`);
  if (step === "prisma migrate deploy") {
    console.error(
      "\nCommon fixes:\n" +
        "1. Run migrations against Neon from your machine:\n" +
        "     $env:DATABASE_URL=\"your-neon-url\"\n" +
        "     npm run db:migrate:deploy\n" +
        "2. P3005 (schema not empty): baseline existing migrations — see docs/ENVIRONMENTS.md\n" +
        "3. P3009 (failed migration): npx prisma migrate resolve --rolled-back <migration_name>\n" +
        "4. Column/type already exists: mark migration applied with migrate resolve --applied\n",
    );
  }
  if (step === "DATABASE_URL check") {
    console.error(
      "\nSet DATABASE_URL in Vercel → Settings → Environment Variables.\n" +
        "Enable it for **Build** and **Runtime**, then redeploy.\n",
    );
  }
  if (error instanceof Error && error.message) {
    console.error(error.message);
  }
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  fail("DATABASE_URL check");
}

try {
  run("npx prisma generate");
} catch (error) {
  fail("prisma generate", error);
}

if (process.env.VERCEL === "1") {
  if (process.env.SKIP_PRISMA_MIGRATE === "1") {
    console.log("\n> Skipping prisma migrate deploy (SKIP_PRISMA_MIGRATE=1)");
  } else {
    try {
      run("npx prisma migrate deploy");
    } catch (error) {
      fail("prisma migrate deploy", error);
    }
  }
}

try {
  run("npx next build --turbopack");
} catch (error) {
  fail("next build", error);
}
