import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z
    .string()
    .min(1, "AUTH_SECRET is required")
    .refine(
      (value) => {
        if (process.env.NODE_ENV !== "production") return true;
        // `next build` sets NODE_ENV=production; validate secret length at runtime only.
        if (process.env.NEXT_PHASE === "phase-production-build") return true;
        return value.length >= 32;
      },
      "AUTH_SECRET must be at least 32 characters in production",
    ),
  AUTH_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type AppEnv = z.infer<typeof envSchema>;

let cachedEnv: AppEnv | null = null;

/** Validates required environment variables. Throws on misconfiguration. */
export function getEnv(): AppEnv {
  if (cachedEnv) return cachedEnv;

  const parsed = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_URL: process.env.AUTH_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Environment configuration error: ${message}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

export function getAuthUrl(): string | undefined {
  return getEnv().AUTH_URL;
}

export function isProduction(): boolean {
  return getEnv().NODE_ENV === "production";
}
