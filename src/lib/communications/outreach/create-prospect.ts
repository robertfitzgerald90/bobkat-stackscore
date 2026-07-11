import { prisma } from "@/lib/db";
import { normalizePurchaserEmail } from "@/lib/stripe/fulfillment/helpers";
import type { ProspectLeadSource } from "@/generated/prisma/client";

export type CreateProspectOnlyInput = {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone?: string | null;
  industry?: string | null;
  employeeCount?: number | null;
  notes?: string | null;
  leadSource?: ProspectLeadSource;
  createdByUserId: string;
  existingProspectId?: string | null;
};

export async function createOrUpdateProspectOnly(input: CreateProspectOnlyInput) {
  const email = normalizePurchaserEmail(input.email);

  if (input.existingProspectId) {
    const existing = await prisma.prospect.findUnique({ where: { id: input.existingProspectId } });
    if (!existing) throw new Error("Prospect not found");
    const updated = await prisma.prospect.update({
      where: { id: existing.id },
      data: {
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        company: input.company.trim(),
        phone: input.phone?.trim() || null,
        industry: input.industry?.trim() || null,
        employeeCount: input.employeeCount ?? null,
        notes: input.notes?.trim() || null,
        lastContactAt: new Date(),
      },
    });
    return { prospect: updated, isNewProspect: false };
  }

  const existing = await prisma.prospect.findUnique({ where: { email } });
  if (existing) {
    const updated = await prisma.prospect.update({
      where: { id: existing.id },
      data: {
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        company: input.company.trim(),
        phone: input.phone?.trim() || null,
        industry: input.industry?.trim() || null,
        employeeCount: input.employeeCount ?? null,
        notes: input.notes?.trim() || null,
        lastContactAt: new Date(),
      },
    });
    return { prospect: updated, isNewProspect: false };
  }

  const created = await prisma.prospect.create({
    data: {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      company: input.company.trim(),
      email,
      phone: input.phone?.trim() || null,
      industry: input.industry?.trim() || null,
      employeeCount: input.employeeCount ?? null,
      notes: input.notes?.trim() || null,
      leadSource: input.leadSource ?? "quick_invite",
      status: "new",
      createdByUserId: input.createdByUserId,
      lastContactAt: new Date(),
    },
  });

  return { prospect: created, isNewProspect: true };
}
