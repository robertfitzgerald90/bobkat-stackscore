/**
 * Vercel production build.
 * - Requires DATABASE_URL in Vercel env (Neon) for migrations + runtime.
 * - Local dev uses .env; production uses Vercel dashboard only.
 */
import { execSync } from "node:child_process";

function run(command) {
  console.log(`> ${command}`);
  execSync(command, { stdio: "inherit", env: process.env });
}

if (!process.env.DATABASE_URL) {
  console.error(
    "\nVercel build error: DATABASE_URL is not set.\n" +
      "Add your Neon connection string in Vercel → Settings → Environment Variables → Production.\n" +
      "Enable it for Build and Runtime, then redeploy.\n",
  );
  process.exit(1);
}

run("npx prisma generate");

if (process.env.VERCEL === "1") {
  run("npx prisma migrate deploy");
}

run("npx next build --turbopack");
