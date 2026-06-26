/**
 * Post-deploy smoke check. Run against a running instance:
 *   npm run smoke
 *   npm run smoke -- http://192.168.1.106:3000
 */
import "dotenv/config";
import { getEnv } from "../src/lib/env";

async function main() {
  const baseUrl = process.argv[2] ?? getEnv().AUTH_URL ?? "http://localhost:3000";

  console.log(`Smoke check: ${baseUrl}`);

  getEnv();
  console.log("✓ Environment variables valid");

  const healthResponse = await fetch(`${baseUrl}/api/v1/health`, {
    signal: AbortSignal.timeout(15_000),
  });

  if (!healthResponse.ok) {
    const body = await healthResponse.text();
    throw new Error(`Health check failed (${healthResponse.status}): ${body}`);
  }

  const health = (await healthResponse.json()) as {
    status: string;
    checks: Record<string, string>;
  };

  if (health.status !== "ok") {
    throw new Error(`Health status unhealthy: ${JSON.stringify(health.checks)}`);
  }

  console.log("✓ Health endpoint OK", health.checks);

  const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`, {
    signal: AbortSignal.timeout(15_000),
  });

  if (!csrfResponse.ok) {
    throw new Error(`Auth CSRF endpoint failed (${csrfResponse.status})`);
  }

  const csrf = (await csrfResponse.json()) as { csrfToken?: string };
  if (!csrf.csrfToken) {
    throw new Error("Auth CSRF token missing from response");
  }

  console.log("✓ Auth endpoints reachable");
  console.log("\nSmoke check passed.");
}

main().catch((error) => {
  console.error("\nSmoke check FAILED:");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
