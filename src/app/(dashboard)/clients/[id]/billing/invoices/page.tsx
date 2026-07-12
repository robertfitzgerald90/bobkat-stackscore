import { auth } from "@/lib/auth";
import { InvoiceListView } from "@/components/billing/invoice-list-view";
import { loadBillingPage } from "@/lib/billing/page-context";

type PageProps = { params: Promise<{ id: string }> };

export default async function ClientBillingInvoicesPage({ params }: PageProps) {
  const { id } = await params;
  await auth();
  const { clientId, isStaff } = await loadBillingPage(id);

  return <InvoiceListView clientId={clientId} isStaff={isStaff} />;
}
