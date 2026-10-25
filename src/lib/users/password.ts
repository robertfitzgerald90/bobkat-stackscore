import bcrypt from "bcryptjs";
import { assertPasswordMeetsPolicy } from "@/lib/users/password-policy";

export const BCRYPT_ROUNDS = 12;

/**
 * Hash a user-chosen password after enforcing the shared password policy.
 * Placeholder / system hashes must use `createPlaceholderPasswordHash` instead.
 */
export async function hashPassword(password: string): Promise<string> {
  const validated = assertPasswordMeetsPolicy(password);
  return bcrypt.hash(validated, BCRYPT_ROUNDS);
}

export {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_LENGTH_MESSAGE,
  passwordSchema,
  optionalPasswordSchema,
  validatePassword,
  assertPasswordMeetsPolicy,
} from "@/lib/users/password-policy";
