/** Normalize Postgres URLs for Neon (silences pg SSL deprecation warning on Vercel). */
export function normalizeDatabaseUrl(connectionString: string): string {
  if (!connectionString.includes("neon.tech")) {
    return connectionString;
  }

  try {
    const parsed = new URL(connectionString.replace(/^postgresql:/, "postgres:"));
    if (!parsed.searchParams.has("sslmode")) {
      parsed.searchParams.set("sslmode", "require");
    }
    if (!parsed.searchParams.has("uselibpqcompat")) {
      parsed.searchParams.set("uselibpqcompat", "true");
    }
    return parsed.toString().replace(/^postgres:/, "postgresql:");
  } catch {
    return connectionString;
  }
}

export function usesNeonSsl(connectionString: string): boolean {
  return (
    connectionString.includes("neon.tech") ||
    connectionString.includes("sslmode=require") ||
    connectionString.includes("sslmode=verify-full")
  );
}
