import { z } from "zod";

/** DOC-303: minimum length only — no complexity blocklist in MVP. */
export const PASSWORD_MIN_LENGTH = 10;

export const PASSWORD_MIN_LENGTH_MESSAGE = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;

/**
 * Shared Zod schema for every password-setting workflow.
 * Never log or include the password value in errors.
 */
export const passwordSchema = z
  .string({ error: "Password is required" })
  .min(PASSWORD_MIN_LENGTH, PASSWORD_MIN_LENGTH_MESSAGE);

/** Optional password on admin user updates — when present, same policy applies. */
export const optionalPasswordSchema = passwordSchema.optional();

export type PasswordPolicyResult =
  | { ok: true; password: string }
  | { ok: false; error: string };

/**
 * Validates a candidate password without echoing the value.
 * Safe for API error responses and UI toasts.
 */
export function validatePassword(password: unknown): PasswordPolicyResult {
  if (typeof password !== "string" || password.length === 0) {
    return { ok: false, error: "Password is required" };
  }

  const parsed = passwordSchema.safeParse(password);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? PASSWORD_MIN_LENGTH_MESSAGE;
    return { ok: false, error: message };
  }

  return { ok: true, password: parsed.data };
}

/** Throws a plain Error with a user-safe message (never includes the password). */
export function assertPasswordMeetsPolicy(password: unknown): string {
  const result = validatePassword(password);
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result.password;
}
