import { redirect } from "next/navigation";
import { AdminAnalyticsView } from "@/components/admin/analytics/admin-analytics-view";
import { canViewAdminAnalytics } from "@/lib/admin-analytics/access";
import { getAdminAnalyticsDashboard } from "@/lib/admin-analytics/service";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminAnalyticsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!canViewAdminAnalytics(session?.user?.role)) {
    redirect("/dashboard");
  }

  const dashboard = await getAdminAnalyticsDashboard(await searchParams);
  return <AdminAnalyticsView dashboard={dashboard} />;
}
