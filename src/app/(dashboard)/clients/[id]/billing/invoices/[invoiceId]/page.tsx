import { auth } from "@/lib/auth";
import { InvoiceDetailView } from "@/components/billing/invoice-detail-view";
import { loadBillingPage } from "@/lib/billing/page-context";

type PageProps = { params: Promise<{ id: string; invoiceId: string }> };

export default async function ClientBillingInvoiceDetailPage({ params }: PageProps) {
  const { id, invoiceId } = await params;
  await auth();
  const { clientId, isStaff } = await loadBillingPage(id);

  return <InvoiceDetailView clientId={clientId} invoiceId={invoiceId} isStaff={isStaff} />;
}
