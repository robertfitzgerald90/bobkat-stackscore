import { redirect } from "next/navigation";
import type { UserRole } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { PortfolioView } from "@/components/portfolio/portfolio-view";
import { getPortfolioSummary } from "@/lib/portfolio";
import { canAccessPortfolio } from "@/lib/navigation/default-landing";

export default async function PortfolioPage() {
  const session = await auth();
  const role = session?.user?.role;

  if (!role || !canAccessPortfolio(role)) {
    redirect("/dashboard");
  }

  const summary = await getPortfolioSummary(role as UserRole);

  return <PortfolioView clients={summary.clients} />;
}
