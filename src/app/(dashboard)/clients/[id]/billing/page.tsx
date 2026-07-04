import { auth } from "@/lib/auth";
import { WorkspaceStub } from "@/components/client-workspace/workspace-stub";
import { loadWorkspaceStubPage } from "@/lib/client-workspace/stub-page";

type PageProps = { params: Promise<{ id: string }> };

export default async function ClientWorkspaceBillingPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const { companyName } = await loadWorkspaceStubPage(id, session);

  return <WorkspaceStub title="Billing" companyName={companyName} />;
}
