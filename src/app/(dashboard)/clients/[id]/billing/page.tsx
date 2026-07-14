import { auth } from "@/lib/auth";
import { BillingDashboard } from "@/components/billing/billing-dashboard";
import { VcioSubscriptionBillingPanel } from "@/components/vcio/vcio-subscription-billing-panel";
import { loadBillingPage } from "@/lib/billing/page-context";

type PageProps = { params: Promise<{ id: string }> };

export default async function ClientWorkspaceBillingPage({ params }: PageProps) {
  const { id } = await params;
  await auth();
  const { clientId, isStaff } = await loadBillingPage(id);

  return (
    <div className="space-y-6">
      <VcioSubscriptionBillingPanel clientId={clientId} />
      <BillingDashboard clientId={clientId} isStaff={isStaff} />
    </div>
  );
}
