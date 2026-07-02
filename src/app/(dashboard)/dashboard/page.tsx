import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getDashboardSummary } from "@/lib/dashboard";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();

  return <DashboardView summary={summary} />;
}
