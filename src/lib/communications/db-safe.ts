import { Prisma } from "@/generated/prisma/client";

export function isPrismaMissingTableError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === "P2021" || error.code === "P2022";
  }
  if (error instanceof Error) {
    return /does not exist|relation .* does not exist/i.test(error.message);
  }
  return false;
}

export async function withCommunicationDbFallback<T>(
  operation: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (isPrismaMissingTableError(error)) {
      return fallback;
    }
    throw error;
  }
}
