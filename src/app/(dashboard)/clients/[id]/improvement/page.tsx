import { notFound } from "next/navigation";
import { getClientImprovementAnalytics } from "@/lib/analytics";
import { ClientImprovementDashboard } from "@/components/analytics/client-improvement-dashboard";

type PageProps = { params: Promise<{ id: string }> };

export default async function ClientImprovementPage({ params }: PageProps) {
  const { id } = await params;
  const analytics = await getClientImprovementAnalytics(id);

  if (!analytics) notFound();

  return <ClientImprovementDashboard analytics={analytics} />;
}
