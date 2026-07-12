import { prisma } from "@/lib/db";

export async function nextInvoiceNumber(clientId: string): Promise<string> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { companyName: true },
  });
  const prefix = (client?.companyName ?? "INV")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 4)
    .toUpperCase()
    .padEnd(4, "X");

  const year = new Date().getFullYear();
  const count = await prisma.invoice.count({
    where: {
      clientId,
      createdAt: {
        gte: new Date(`${year}-01-01T00:00:00.000Z`),
      },
    },
  });

  return `${prefix}-${year}-${String(count + 1).padStart(4, "0")}`;
}
