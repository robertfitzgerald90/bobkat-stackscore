import { prisma } from "@/lib/db";
import { normalizePurchaserEmail } from "@/lib/stripe/fulfillment/helpers";

export type DuplicateMatchType = "prospect" | "organization" | "user";

export type DuplicateMatch = {
  type: DuplicateMatchType;
  id: string;
  label: string;
  email: string;
  href: string;
  canResend: boolean;
};

export async function findDuplicateByEmail(email: string): Promise<DuplicateMatch | null> {
  const normalized = normalizePurchaserEmail(email);
  if (!normalized) return null;

  const prospect = await prisma.prospect.findUnique({
    where: { email: normalized },
    select: { id: true, firstName: true, lastName: true, email: true, clientId: true },
  });
  if (prospect) {
    return {
      type: "prospect",
      id: prospect.id,
      label: `${prospect.firstName} ${prospect.lastName}`.trim(),
      email: prospect.email,
      href: `/admin/communications/prospects/${prospect.id}`,
      canResend: true,
    };
  }

  const client = await prisma.client.findFirst({
    where: { primaryContactEmail: normalized },
    select: { id: true, companyName: true, primaryContactEmail: true },
  });
  if (client) {
    return {
      type: "organization",
      id: client.id,
      label: client.companyName,
      email: client.primaryContactEmail,
      href: `/clients/${client.id}`,
      canResend: true,
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: { id: true, name: true, email: true, clientId: true },
  });
  if (user) {
    return {
      type: "user",
      id: user.id,
      label: user.name,
      email: user.email,
      href: user.clientId ? `/clients/${user.clientId}` : `/admin/users`,
      canResend: true,
    };
  }

  return null;
}
