import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TechnologyDetailView } from "@/components/technology-catalog/technology-detail-view";
import { getTechnologyBySlug } from "@/lib/technology-catalog";
import { isConsultantMode } from "@/lib/navigation/portal-mode";

type TechnologyDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function TechnologyDetailPage({ params }: TechnologyDetailPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isConsultantMode(session.user.role)) redirect("/dashboard");

  const { slug } = await params;
  const technology = await getTechnologyBySlug(slug);
  if (!technology) notFound();

  return <TechnologyDetailView technology={technology} />;
}
