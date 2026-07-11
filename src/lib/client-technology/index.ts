import { prisma } from "@/lib/db";
import type { ClientTechnologyRecord } from "@/lib/technology-catalog/types";

const clientTechnologyInclude = {
  technology: {
    select: {
      id: true,
      slug: true,
      name: true,
      vendor: true,
      standardStatus: true,
      category: { select: { name: true } },
    },
  },
  technologyProduct: {
    select: {
      id: true,
      name: true,
      modelNumber: true,
    },
  },
} as const;

function mapClientTechnology(
  record: Awaited<ReturnType<typeof fetchClientTechnologies>>[number],
): ClientTechnologyRecord {
  return {
    id: record.id,
    clientId: record.clientId,
    technologyId: record.technologyId,
    technologyProductId: record.technologyProductId,
    displayName: record.displayName,
    businessPurpose: record.businessPurpose,
    deploymentStatus: record.deploymentStatus,
    alignmentStatus: record.alignmentStatus,
    healthStatus: record.healthStatus,
    lifecycleStatus: record.lifecycleStatus,
    quantity: record.quantity,
    quantityUnit: record.quantityUnit,
    coverageNotes: record.coverageNotes,
    managedBy: record.managedBy,
    vendorAccountReference: record.vendorAccountReference,
    implementationDate: record.implementationDate?.toISOString() ?? null,
    renewalDate: record.renewalDate?.toISOString() ?? null,
    reviewDate: record.reviewDate?.toISOString() ?? null,
    ownerName: record.ownerName,
    technicalOwnerName: record.technicalOwnerName,
    exceptionReason: record.exceptionReason,
    notes: record.notes,
    isActive: record.isActive,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    technology: {
      id: record.technology.id,
      slug: record.technology.slug,
      name: record.technology.name,
      vendor: record.technology.vendor,
      standardStatus: record.technology.standardStatus,
      categoryName: record.technology.category.name,
    },
    technologyProduct: record.technologyProduct,
  };
}

async function fetchClientTechnologies(clientId: string) {
  return prisma.clientTechnology.findMany({
    where: { clientId, isActive: true },
    include: clientTechnologyInclude,
    orderBy: [{ deploymentStatus: "asc" }, { updatedAt: "desc" }],
  });
}

export async function getClientTechnologies(clientId: string): Promise<ClientTechnologyRecord[]> {
  const records = await fetchClientTechnologies(clientId);
  return records.map(mapClientTechnology);
}

export async function getClientTechnologyProfileSummary(clientId: string) {
  const [deployments, client] = await Promise.all([
    fetchClientTechnologies(clientId),
    prisma.client.findUnique({
      where: { id: clientId },
      select: { companyName: true },
    }),
  ]);

  if (!client) return null;

  const mapped = deployments.map(mapClientTechnology);
  const preferredCount = mapped.filter(
    (deployment) => deployment.alignmentStatus === "preferred",
  ).length;
  const exceptionCount = mapped.filter(
    (deployment) => deployment.alignmentStatus === "exception",
  ).length;
  const atRiskCount = mapped.filter(
    (deployment) => deployment.healthStatus === "at_risk" || deployment.healthStatus === "attention_needed",
  ).length;

  return {
    companyName: client.companyName,
    deployments: mapped,
    metrics: {
      total: mapped.length,
      preferredCount,
      exceptionCount,
      atRiskCount,
    },
  };
}

export type CreateClientTechnologyInput = {
  technologyId: string;
  technologyProductId?: string | null;
  displayName?: string | null;
  businessPurpose?: string | null;
  deploymentStatus?: string;
  alignmentStatus?: string;
  healthStatus?: string;
  quantity?: number | null;
  quantityUnit?: string | null;
  managedBy?: string;
  notes?: string | null;
};

export async function createClientTechnology(clientId: string, input: CreateClientTechnologyInput) {
  const technology = await prisma.technology.findUnique({
    where: { id: input.technologyId, isActive: true },
    select: { id: true, standardStatus: true },
  });

  if (!technology) {
    throw new Error("Technology not found");
  }

  const defaultAlignment =
    technology.standardStatus === "preferred"
      ? "preferred"
      : technology.standardStatus === "approved"
        ? "approved"
        : "unassessed";

  const record = await prisma.clientTechnology.create({
    data: {
      clientId,
      technologyId: input.technologyId,
      technologyProductId: input.technologyProductId ?? null,
      displayName: input.displayName ?? null,
      businessPurpose: input.businessPurpose ?? null,
      deploymentStatus: (input.deploymentStatus as never) ?? "active",
      alignmentStatus: (input.alignmentStatus as never) ?? defaultAlignment,
      healthStatus: (input.healthStatus as never) ?? "unknown",
      quantity: input.quantity ?? null,
      quantityUnit: input.quantityUnit ?? null,
      managedBy: (input.managedBy as never) ?? "bobkat_it",
      notes: input.notes ?? null,
    },
    include: clientTechnologyInclude,
  });

  return mapClientTechnology(record);
}

export async function deleteClientTechnology(clientId: string, deploymentId: string) {
  const existing = await prisma.clientTechnology.findFirst({
    where: { id: deploymentId, clientId },
  });

  if (!existing) return false;

  await prisma.clientTechnology.update({
    where: { id: deploymentId },
    data: { isActive: false },
  });

  return true;
}
