import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { InvoiceCreateForm } from "@/components/billing/invoice-create-form";
import { loadBillingPage } from "@/lib/billing/page-context";
import { prisma } from "@/lib/db";

type PageProps = { params: Promise<{ id: string }> };

export default async function ClientBillingNewInvoicePage({ params }: PageProps) {
  const { id } = await params;
  await auth();
  const { clientId, isStaff } = await loadBillingPage(id);
  if (!isStaff) redirect(`/clients/${clientId}/billing`);

  const [tips, projects] = await Promise.all([
    prisma.technologyImprovementPlan.findMany({
      where: { clientId },
      select: { id: true, title: true, status: true },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
    prisma.project.findMany({
      where: { clientId },
      select: { id: true, title: true },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
  ]);

  if (!tips.length && !projects.length) {
    // Still allow manual creation
  }

  return <InvoiceCreateForm clientId={clientId} tips={tips} projects={projects} />;
}
