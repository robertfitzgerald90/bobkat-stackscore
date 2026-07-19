import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Customer360View } from "@/components/commercial-intelligence/customer-360-dashboard";
import { prisma } from "@/lib/db";
import { getCustomer360Dashboard } from "@/lib/commercial-intelligence";
import { isCustomerMode } from "@/lib/navigation/portal-mode";

type PageProps = { params: Promise<{ id: string }> };

export default async function Customer360Page({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (isCustomerMode(session.user.role)) {
    redirect(`/clients/${id}/lifecycle`);
  }

  const client = await prisma.client.findUnique({ where: { id }, select: { id: true } });
  if (!client) notFound();

  const dashboard = await getCustomer360Dashboard(id);
  if (!dashboard) notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <Customer360View dashboard={dashboard} />
    </div>
  );
}
