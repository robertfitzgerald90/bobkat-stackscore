import type { Prisma } from "@/generated/prisma/client";
import { withCommunicationDbFallback } from "@/lib/communications/db-safe";
import { mergeTemplateData } from "@/lib/communications/sample-data";
import { prisma } from "@/lib/db";

export type SampleProfileView = {
  id: string;
  name: string;
  templateKey: string | null;
  sampleData: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

function mapProfile(record: {
  id: string;
  name: string;
  templateKey: string | null;
  sampleDataJson: unknown;
  createdAt: Date;
  updatedAt: Date;
}): SampleProfileView {
  return {
    id: record.id,
    name: record.name,
    templateKey: record.templateKey,
    sampleData: (record.sampleDataJson as Record<string, unknown>) ?? {},
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function listSampleProfiles(templateKey?: string): Promise<SampleProfileView[]> {
  return withCommunicationDbFallback(async () => {
    const records = await prisma.communicationSampleProfile.findMany({
      where: templateKey
        ? { OR: [{ templateKey }, { templateKey: null }] }
        : undefined,
      orderBy: { updatedAt: "desc" },
    });
    return records.map(mapProfile);
  }, []);
}

export async function createSampleProfile(input: {
  name: string;
  templateKey?: string;
  sampleData: Record<string, unknown>;
  userId: string;
}): Promise<SampleProfileView> {
  const record = await prisma.communicationSampleProfile.create({
    data: {
      name: input.name,
      templateKey: input.templateKey ?? null,
      sampleDataJson: input.sampleData as Prisma.InputJsonValue,
      createdByUserId: input.userId,
    },
  });
  return mapProfile(record);
}

export async function deleteSampleProfile(id: string): Promise<void> {
  await prisma.communicationSampleProfile.delete({ where: { id } });
}

export function resolveSampleData(
  base: Record<string, unknown>,
  profile?: SampleProfileView | null,
  overrides?: Record<string, unknown>,
): Record<string, unknown> {
  return mergeTemplateData(
    mergeTemplateData(base, profile?.sampleData ?? {}),
    overrides ?? {},
  );
}
