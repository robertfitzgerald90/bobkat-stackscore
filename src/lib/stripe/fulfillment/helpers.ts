import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";

export const STAFF_ROLES = ["admin", "technician"] as const;

export function normalizePurchaserEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function generateActivationToken(): { rawToken: string; tokenHash: string } {
  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, tokenHash };
}

export async function createPlaceholderPasswordHash(): Promise<string> {
  const random = randomBytes(32).toString("hex");
  return bcrypt.hash(random, 12);
}

export function resolveCompanyName(customerName: string | null | undefined): string {
  const trimmed = customerName?.trim();
  return trimmed ? trimmed : "Company Pending";
}

export function resolveContactName(
  customerName: string | null | undefined,
  email: string,
): string {
  const trimmed = customerName?.trim();
  if (trimmed) return trimmed;
  const localPart = email.split("@")[0]?.trim();
  return localPart || "Purchaser";
}

export function activationTokenExpiresAt(days = 7): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
